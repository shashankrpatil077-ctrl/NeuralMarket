import os
import base64
import binascii
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Hash import SHA256

# 1. Generate a mathematically secure 32-byte hex secret
raw_secret = binascii.hexlify(os.urandom(32)).decode()
print(f"\n=== 1. YOUR RAW ENTITY SECRET ===")
print(raw_secret)
print("(Save this securely. It never expires.)")

# 2. Paste your Public Key exactly as it appears in the Circle Dashboard
public_key_pem = """-----BEGIN PUBLIC KEY-----
PASTE_YOUR_ENTIRE_KEY_HERE_INCLUDING_THE_BEGIN_AND_END_LINES
-----END PUBLIC KEY-----"""

try:
    # 3. Encrypt the secret using Circle's required algorithm (RSA-OAEP with SHA-256)
    rsa_key = RSA.import_key(public_key_pem)
    cipher = PKCS1_OAEP.new(rsa_key, hashAlgo=SHA256)
    
    # We encrypt the raw hex bytes
    encrypted_bytes = cipher.encrypt(bytes.fromhex(raw_secret))
    
    # Encode the encrypted bytes in Base64
    ciphertext = base64.b64encode(encrypted_bytes).decode()
    
    print(f"\n=== 2. YOUR ENTITY_SECRET_CIPHERTEXT ===")
    print(ciphertext)
    print("(This goes into your .env file!)")

except Exception as e:
    print(f"Encryption failed: {e}")