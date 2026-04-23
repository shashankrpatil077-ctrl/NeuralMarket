import os
import uuid
import base64
import requests
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from dotenv import load_dotenv

load_dotenv()

API_KEY       = os.getenv("CIRCLE_API_KEY")
ENTITY_SECRET = os.getenv("CIRCLE_ENTITY_SECRET")
BASE_URL      = "https://api.circle.com/v1/w3s"

# Arc Testnet USDC token address
ARC_USDC_ADDRESS = "0x3600000000000000000000000000000000000000"

HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type":  "application/json",
}


# ==========================================
# Internal: Crypto helpers
# ==========================================

def _get_entity_public_key() -> str:
    """Fetch Circle's current RSA public key for entity secret encryption."""
    r = requests.get(f"{BASE_URL}/config/entity/publicKey", headers=HEADERS)
    if r.status_code == 200:
        return r.json()["data"]["publicKey"]
    raise RuntimeError(f"Failed to get Circle public key: {r.text}")


def _generate_ciphertext() -> str:
    """Encrypt ENTITY_SECRET with Circle's public key (fresh every call)."""
    public_key = serialization.load_pem_public_key(
        _get_entity_public_key().encode()
    )
    secret_bytes = bytes.fromhex(ENTITY_SECRET)
    ciphertext   = public_key.encrypt(
        secret_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None,
        ),
    )
    return base64.b64encode(ciphertext).decode()


# ==========================================
# Public helpers
# ==========================================

def get_balance(wallet_id: str) -> float:
    """Return USDC balance for a Circle wallet, or 0.0 on error."""
    if not wallet_id:
        return 0.0
    try:
        r = requests.get(f"{BASE_URL}/wallets/{wallet_id}/balances", headers=HEADERS)
        if r.status_code == 200:
            for b in r.json().get("data", {}).get("tokenBalances", []):
                if b.get("token", {}).get("symbol") == "USDC":
                    return float(b.get("amount", 0))
        else:
            print(f"⚠️  Balance error [{r.status_code}]: {r.text}")
    except Exception as e:
        print(f"⚠️  get_balance failed: {e}")
    return 0.0


def transfer_usdc(
    source_wallet_id:    str,
    destination_address: str,
    amount,              # Accept float, int, or string
    note:                str = "",
) -> str | None:
    """
    Transfer USDC from a Circle developer wallet to any address on Arc Testnet.
    Returns the Circle transaction ID, or None on failure.
    """
    if not source_wallet_id or not destination_address:
        print("❌ transfer_usdc: missing wallet_id or destination_address — skipped")
        return None
    if not API_KEY or not ENTITY_SECRET:
        print("❌ transfer_usdc: CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not set in .env")
        return None

    # ----- Robust amount conversion (handles float, int, str) -----
    try:
        if isinstance(amount, str):
            amount_val = float(amount.strip())
        elif isinstance(amount, (int, float)):
            amount_val = float(amount)
        else:
            raise ValueError(f"Unsupported amount type: {type(amount)}")
    except (ValueError, TypeError) as e:
        print(f"❌ transfer_usdc: invalid amount '{amount}': {e}")
        return None

    # Format with exactly 6 decimal places for USDC
    amount_str = f"{amount_val:.6f}"

    try:
        payload = {
            "idempotencyKey":          str(uuid.uuid4()),
            "entitySecretCiphertext":  _generate_ciphertext(),   # fresh every call
            "amounts":                 [amount_str],
            "destinationAddress":      destination_address,
            "feeLevel":                "MEDIUM",
            "tokenAddress":            ARC_USDC_ADDRESS,
            "blockchain":              "ARC-TESTNET",
            "walletId":                source_wallet_id,
        }
        r = requests.post(
            f"{BASE_URL}/developer/transactions/transfer",
            json=payload,
            headers=HEADERS,
        )
        if r.status_code in (200, 201):
            tx_id = r.json().get("data", {}).get("id")
            print(f"✅ Paid {amount_str} USDC → {destination_address[:10]}... | Tx: {tx_id} | {note}")
            return tx_id
        else:
            print(f"❌ Transfer failed [{r.status_code}]: {r.text}")
            return None
    except Exception as e:
        print(f"❌ transfer_usdc exception: {e}")
        return None


def list_wallets() -> list:
    """Print and return all wallets in the Circle project."""
    r = requests.get(
        f"{BASE_URL}/wallets",
        headers=HEADERS,
        params={"pageSize": 50},
    )
    if r.status_code == 200:
        wallets = r.json().get("data", {}).get("wallets", [])
        print(f"{'Address':<45} Wallet ID")
        print("-" * 80)
        for w in wallets:
            print(f"{w['address']:<45} {w['id']}")
        return wallets
    print(f"❌ list_wallets error [{r.status_code}]: {r.text}")
    return []