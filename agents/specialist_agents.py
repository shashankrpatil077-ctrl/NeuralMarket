import os
import asyncio
import aiohttp
from dotenv import load_dotenv
from x402_client import x402_fetch

load_dotenv()

FEATHERLESS_API_KEY  = os.getenv("FEATHERLESS_API_KEY")
FEATHERLESS_BASE_URL = "https://api.featherless.ai/v1"


async def call_featherless(
    session:    aiohttp.ClientSession,
    agent_name: str,
    model:      str,
    prompt:     str,
    max_tokens: int = 512,
    temperature: float = 0.7,
    timeout:    int = 30,
) -> dict:
    """
    Call any model hosted on Featherless.ai (OpenAI-compatible endpoint).
    Returns a standardised dict: {agent, status, output, model} or {agent, status, error, output}.
    """
    if not FEATHERLESS_API_KEY:
        return {
            "agent":  agent_name,
            "status": "failed",
            "error":  "FEATHERLESS_API_KEY not set in .env",
            "output": "",
        }

    headers = {
        "Authorization": f"Bearer {FEATHERLESS_API_KEY}",
        "Content-Type":  "application/json",
    }
    payload = {
        "model":       model,
        "messages":    [{"role": "user", "content": prompt}],
        "max_tokens":  max_tokens,
        "temperature": temperature,
    }

    try:
        async with session.post(
            f"{FEATHERLESS_BASE_URL}/chat/completions",
            headers=headers,
            json=payload,
            timeout=aiohttp.ClientTimeout(total=timeout),
        ) as response:
            data = await response.json()

            if response.status != 200:
                error_msg = (
                    data.get("error", {}).get("message")
                    or f"HTTP {response.status}"
                )
                return {"agent": agent_name, "status": "failed", "error": error_msg, "output": ""}

            output = (
                data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                    .strip()
            )
            return {"agent": agent_name, "status": "success", "output": output, "model": model}

    except asyncio.TimeoutError:
        return {"agent": agent_name, "status": "failed", "error": f"Timeout after {timeout}s", "output": ""}
    except aiohttp.ClientConnectorError as e:
        return {"agent": agent_name, "status": "failed", "error": f"Connection error: {e}", "output": ""}
    except Exception as e:
        return {"agent": agent_name, "status": "failed", "error": str(e), "output": ""}


async def fetch_premium_data(agent_name: str, wallet_id: str) -> dict:
    """
    Specialist agent fetches premium data using x402 protocol.
    This demonstrates the full autonomous payment flow.
    """
    # This URL would be an AIsa endpoint in production
    # For demo, we call our own protected endpoint
    base_url = os.getenv("NEURALMARKET_URL", "http://localhost:8000")
    url = f"{base_url}/premium-insight"
    
    result = await x402_fetch(
        url=url,
        source_wallet_id=wallet_id,
        max_price_usdc=0.001
    )
    
    return {
        "agent": agent_name,
        "x402_result": result["status"],
        "paid_usdc": result.get("price_usdc", 0),
        "tx_id": result.get("tx_id"),
        "data": result.get("data", {})
    }
