from flask import Flask, jsonify, request
from flask_cors import CORS
from pymongo import MongoClient
from cryptography.fernet import Fernet, InvalidToken
import os
import datetime

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

MONGO_URI = "mongodb+srv://shashank:shashank123@sem6-project.lfg2l.mongodb.net/CSF?retryWrites=true&w=majority&appName=Sem6-Project"
client = MongoClient(MONGO_URI)
db = client["CSF_db"]
users_collection = db["users"]
encrypted_files_collection = db["encrypted_files"]  # Create a new collection for encrypted files

SECRET_KEY = "shashankgupta"  # Secret key for JWT

def load_key():
    return open("Secret.key", "rb").read()

def encrypt(filename, key):
    f = Fernet(key)
    with open(filename, "rb") as file:
        file_data = file.read()
        encrypted_data = f.encrypt(file_data)
    
    if not os.path.exists("encryption"):
        os.makedirs("encryption")

    encrypted_filename = os.path.join("encryption", filename)
    with open(encrypted_filename, "wb") as file:
        file.write(encrypted_data)

@app.route("/encrypt", methods=["POST"])
def encrypt_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    email = request.form.get("email")
    token = request.form.get("token")

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = file.filename
    file.save(filename)

    try:
        # Verify the token here if necessary (check token in the database for validity)
        # This is a simple placeholder; add more validation if needed
        if not token or not email:
            return jsonify({"error": "Missing email or token"}), 400

        key = load_key()
        encrypt(filename, key)
        os.remove(filename)  # Remove original file after encryption

        # Save the file metadata and encrypted file information in the database
        encrypted_file_data = {
            "email": email,
            "token": token,
            "filename": filename,
            "encrypted_filename": os.path.join("encryption", filename),
            "date_encrypted": datetime.datetime.utcnow()
        }

        # Insert the encrypted file data into the encrypted_files collection
        encrypted_files_collection.insert_one(encrypted_file_data)

        return jsonify({"message": "File encrypted successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
