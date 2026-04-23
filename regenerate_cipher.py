from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
import base64
import os
from dotenv import load_dotenv

load_dotenv()

ENTITY_SECRET = os.getenv("CIRCLE_ENTITY_SECRET")

# Paste your Circle Entity Public Key here
# Get it from: developers.circle.com → Your project → Entity Secret page
ENTITY_PUBLIC_KEY_PEM = """-----BEGIN PUBLIC KEY-----
PASTE_YOUR_PUBLIC_KEY_HERE
-----END PUBLIC KEY-----"""

entity_secret_bytes = bytes.fromhex(ENTITY_SECRET)

public_key = serialization.load_pem_public_key(
    ENTITY_PUBLIC_KEY_PEM.encode()
)

ciphertext = public_key.encrypt(
    entity_secret_bytes,
    padding.OAEP(
        mgf=padding.MGF1(algorithm=hashes.SHA256()),
        algorithm=hashes.SHA256(),
        label=None
    )
)

result = base64.b64encode(ciphertext).decode()
print(f"\nCIPHERTEXT:\n{result}\n")
print("Copy this and add to .env as CIRCLE_ENTITY_SECRET_CIPHERTEXT=...")
