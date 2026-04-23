from payments.circle_client import transfer_usdc, get_balance
import os
from dotenv import load_dotenv
load_dotenv()

# Check balance first
orch_id = os.getenv("ORCHESTRATOR_WALLET_ID")
balance = get_balance(orch_id)
print(f"Orchestrator balance: {balance} USDC")

# Try a small transfer
tx = transfer_usdc(
    source_wallet_id=orch_id,
    destination_address=os.getenv("CODEAGENT_ADDRESS"),
    amount=0.001,
    note="test transfer"
)
print(f"TX ID: {tx}")
