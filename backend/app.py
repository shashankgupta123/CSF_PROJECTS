from flask import Flask, request, jsonify, send_file
from cryptography.fernet import Fernet
import os
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
from jwt import ExpiredSignatureError, InvalidTokenError # Ensure 'PyJWT' is installed
import os
import datetime
from schemas import RegisterSchema, LoginSchema  # Import from schemas.py
from werkzeug.utils import secure_filename
import jwt

app = Flask(__name__)
CORS(app)

# MongoDB Configuration
MONGO_URI = "mongodb+srv://shashank:shashank123@sem6-project.lfg2l.mongodb.net/CSF?retryWrites=true&w=majority&appName=Sem6-Project"
client = MongoClient(MONGO_URI)
db = client["CSF_db"]
users_collection = db["users"]
encrypted_files_collection = db["encrypted_files"]

# Secret Key for JWT
SECRET_KEY = "shashankgupta"


UPLOAD_FOLDER = "uploads"
ENCRYPTED_FOLDER = "encryption"
DECRYPTED_FOLDER = "decryption"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(ENCRYPTED_FOLDER, exist_ok=True)
os.makedirs(DECRYPTED_FOLDER, exist_ok=True)

# Register User Route
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    
    # Validate data using schema
    schema = RegisterSchema()
    errors = schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400

    name = data["name"]
    email = data["email"]
    password = data["password"]

    # Check if user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # Generate JWT Token (Use PyJWT correctly)
    token = jwt.encode(
        {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY,
        algorithm="HS256",
    )

    # Insert into DB
    user_data = {
        "name": name,
        "email": email,
        "password": hashed_password.decode("utf-8"),
        "created_at": datetime.datetime.utcnow(),
        "token": token,
    }

    try:
        users_collection.insert_one(user_data)
        return jsonify({"message": "User registered successfully", "token": token}), 201
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500
    
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    # Check if user exists in database
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Verify password
    if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT token
    token = jwt.encode(
        {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY,
        algorithm="HS256",
    )

    return jsonify({"message": "Login successful", "token": token}), 200

def generate_key():
    if not os.path.exists("Secret.key"):
        key = Fernet.generate_key()
        with open("Secret.key", "wb") as key_file:
            key_file.write(key)

def load_key():
    return open("Secret.key", "rb").read()

def encrypt_file(filepath, key):
    f = Fernet(key)
    with open(filepath, "rb") as file:
        file_data = file.read()
        encrypted_data = f.encrypt(file_data)
    enc_path = os.path.join(ENCRYPTED_FOLDER, os.path.basename(filepath))
    with open(enc_path, "wb") as file:
        file.write(encrypted_data)
    return enc_path

def decrypt_file(filepath, key):
    f = Fernet(key)
    with open(filepath, "rb") as file:
        encrypted_data = file.read()
    try:
        decrypted_data = f.decrypt(encrypted_data)
    except Exception:
        return None
    dec_path = os.path.join(DECRYPTED_FOLDER, os.path.basename(filepath))
    with open(dec_path, "wb") as file:
        file.write(decrypted_data)
    return dec_path

@app.route("/encrypt", methods=["POST"])
def encrypt():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    filepath = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(filepath)
    
    generate_key()
    key = load_key()
    encrypted_filepath = encrypt_file(filepath, key)
    
    return jsonify({"message": "File encrypted successfully", "encrypted_file": encrypted_filepath})

@app.route("/decrypt", methods=["POST"])
def decrypt():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    email = request.form.get("email")
    token = request.form.get("token")
    
    filepath = os.path.join(ENCRYPTED_FOLDER, file.filename)
    file.save(filepath)

    key = load_key()
    decrypted_filepath = decrypt_file(filepath, key)
    
    if not decrypted_filepath:
        return jsonify({"error": "Decryption failed. Invalid key or corrupted file."}), 400

    return send_file(decrypted_filepath, as_attachment=True)



if __name__ == "__main__":
    app.run(debug=True)