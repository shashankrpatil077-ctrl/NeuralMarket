import requests
import base64
from Crypto.PublicKey import RSA
from Crypto.Cipher import PKCS1_OAEP
from Crypto.Hash import SHA256

# Your API Key and Raw Secret
API_KEY = "TEST_API_KEY:5c36f2dcebb0fd969b14ef0b94ec5a08:4723d4aacacb06a82f93204cd07d14ff"
RAW_SECRET = "d70a4ad05dc092052e25232682b0be45682d1637c936cf0407d08e75c14baaf5"

try:
    print("1. Fetching Public Key from Circle...")
    url = "https://api.circle.com/v1/w3s/config/entity/publicKey"
    headers = {"Authorization": f"Bearer {API_KEY}"}
    
    response = requests.get(url, headers=headers)
    response.raise_for_status() 
    
    # Grab the perfectly formatted key straight from their database
    public_key_pem = response.json()["data"]["publicKey"]
    print("2. Successfully retrieved Public Key! Encrypting now...")
    
    # Encrypt the secret
    rsa_key = RSA.import_key(public_key_pem)
    cipher = PKCS1_OAEP.new(rsa_key, hashAlgo=SHA256)
    encrypted_bytes = cipher.encrypt(bytes.fromhex(RAW_SECRET))
    ciphertext = base64.b64encode(encrypted_bytes).decode()
    
    print("\n=== SUCCESS! YOUR ENTITY_SECRET_CIPHERTEXT ===")
    print(ciphertext)
    print("\n(Copy the massive string above!)")
    
except Exception as e:
    print(f"\nError: {e}")
