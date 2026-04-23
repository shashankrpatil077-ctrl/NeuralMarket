# x402_client.py
import httpx
import os
from dotenv import load_dotenv
from payments.circle_client import transfer_usdc

load_dotenv()

async def x402_fetch(
    url: str,
    source_wallet_id: str,
    max_price_usdc: float = 0.01,
    method: str = "GET",
    headers: dict = None,
    body: dict = None
) -> dict:
    """
    x402 Protocol Client — handles the HTTP 402 payment flow automatically.
    """
    async with httpx.AsyncClient(timeout=30) as client:
        request_kwargs = {"headers": headers or {}}
        if body:
            request_kwargs["json"] = body
        
        # Step 1: Initial request
        if method.upper() == "GET":
            resp = await client.get(url, **request_kwargs)
        else:
            resp = await client.post(url, **request_kwargs)
        
        print(f"📡 Initial request: {resp.status_code}")
        
        # If not 402, return as-is
        if resp.status_code != 402:
            try:
                data = resp.json()
            except:
                data = {"raw": resp.text}
            return {
                "status": "success",
                "data": data,
                "paid": False,
                "status_code": resp.status_code
            }
        
        # Step 2: Parse payment instructions from 402 response
        try:
            payment_info = resp.json()
        except:
            return {"status": "error", "message": "Invalid 402 response JSON"}
        
        price = float(payment_info.get("maxAmountRequired", 0.001))
        destination = payment_info.get("payTo")
        
        if not destination:
            return {"status": "error", "message": "No payTo address in 402 response"}
        
        if price > max_price_usdc:
            return {
                "status": "too_expensive",
                "price": price,
                "max_allowed": max_price_usdc
            }
        
        # Step 3: Execute payment via Circle
        print(f"💳 x402: Paying {price} USDC to {destination[:10]}...")
        tx_id = transfer_usdc(
            source_wallet_id=source_wallet_id,
            destination_address=destination,
            amount=price,
            note=f"x402 payment for {url}"
        )
        
        if not tx_id:
            return {"status": "payment_failed", "message": "Circle transfer failed"}
        
        print(f"✅ x402 payment complete | Tx: {tx_id}")
        
        # Step 4: Retry with payment proof
        retry_headers = (headers or {}).copy()
        retry_headers["X-Payment-TxId"] = tx_id
        
        print(f"🔄 Retrying with X-Payment-TxId: {tx_id[:8]}...")
        
        if method.upper() == "GET":
            retry_resp = await client.get(url, headers=retry_headers)
        else:
            retry_resp = await client.post(url, headers=retry_headers, json=body)
        
        print(f"📡 Retry response: {retry_resp.status_code}")
        
        # Parse retry response
        try:
            retry_data = retry_resp.json()
        except:
            retry_data = {"raw": retry_resp.text}
        
        if retry_resp.status_code == 200:
            return {
                "status": "success",
                "data": retry_data,
                "paid": True,
                "price_usdc": price,
                "tx_id": tx_id,
                "status_code": retry_resp.status_code
            }
        else:
            return {
                "status": "access_denied",
                "data": retry_data,
                "paid": True,
                "price_usdc": price,
                "tx_id": tx_id,
                "status_code": retry_resp.status_code,
                "message": f"Payment succeeded but access still denied (HTTP {retry_resp.status_code})"
            }