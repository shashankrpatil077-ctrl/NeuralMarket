import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("CIRCLE_API_KEY")
ENTITY_SECRET = os.getenv("CIRCLE_ENTITY_SECRET")
BASE_URL = "https://api.circle.com/v1/w3s"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# List wallets
response = requests.get(
    f"{BASE_URL}/wallets",
    headers=headers,
    params={"pageSize": 50}
)

if response.status_code != 200:
    print("Error:", response.status_code, response.text)
    exit(1)

wallets = response.json().get("data", {}).get("wallets", [])
print("Address -> Wallet ID")
for w in wallets:
    print(f"{w['address']} -> {w['id']}")
