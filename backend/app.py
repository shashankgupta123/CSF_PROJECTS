from flask import Flask, request, jsonify, send_file
from cryptography.fernet import Fernet
import os
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import jwt
import datetime
from jwt import ExpiredSignatureError, InvalidTokenError
from schemas import RegisterSchema, LoginSchema  # Import from schemas.py
from werkzeug.utils import secure_filename

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

# Define folders
UPLOAD_FOLDER = "uploads"
ENCRYPTED_FOLDER = "encryption"
DECRYPTED_FOLDER = "decryption"

# Ensure necessary directories exist
for folder in [UPLOAD_FOLDER, ENCRYPTED_FOLDER, DECRYPTED_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Generate secret key if not present
def generate_key():
    if not os.path.exists("Secret.key"):
        key = Fernet.generate_key()
        with open("Secret.key", "wb") as key_file:
            key_file.write(key)

def load_key():
    return open("Secret.key", "rb").read()

# Encryption function
def encrypt_file(filepath, key):
    f = Fernet(key)
    with open(filepath, "rb") as file:
        file_data = file.read()
        encrypted_data = f.encrypt(file_data)
    
    enc_path = os.path.join(ENCRYPTED_FOLDER, os.path.basename(filepath))
    with open(enc_path, "wb") as file:
        file.write(encrypted_data)
    
    return enc_path

# Decryption function
def decrypt_file(filepath, key):
    f = Fernet(key)
    with open(filepath, "rb") as file:
        encrypted_data = file.read()
    
    try:
        decrypted_data = f.decrypt(encrypted_data)
    except Exception:
        return None  # Decryption failed
    
    dec_path = os.path.join(DECRYPTED_FOLDER, os.path.basename(filepath))
    with open(dec_path, "wb") as file:
        file.write(decrypted_data)
    
    return dec_path

# Register User Route
@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    schema = RegisterSchema()
    errors = schema.validate(data)
    if errors:
        return jsonify({"error": errors}), 400

    name, email, password = data["name"], data["email"], data["password"]

    # Check if user exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    # Generate JWT Token
    token = jwt.encode(
        {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY,
        algorithm="HS256",
    )

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

# Login Route (Fetch existing token if valid)
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email, password = data.get("email"), data.get("password")

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401

    existing_token = user.get("token")
    
    # Validate existing token
    if existing_token:
        try:
            jwt.decode(existing_token, SECRET_KEY, algorithms=["HS256"])
            return jsonify({"message": "Login successful", "token": existing_token}), 200
        except ExpiredSignatureError:
            pass  # Expired, generate a new one

    # Generate new JWT token
    new_token = jwt.encode(
        {"email": email, "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)},
        SECRET_KEY,
        algorithm="HS256",
    )

    # Update token in DB
    users_collection.update_one({"email": email}, {"$set": {"token": new_token}})
    return jsonify({"message": "Login successful", "token": new_token}), 200

# Encrypt Route
@app.route("/encrypt", methods=["POST"])
def encrypt():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    email, token = request.form.get("email"), request.form.get("token")

    if not email or not token:
        return jsonify({"error": "Missing email or token"}), 400

    # Save uploaded file
    original_filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, original_filename)
    file.save(filepath)

    generate_key()
    key = load_key()
    encrypted_filepath = encrypt_file(filepath, key)
    encrypted_filename = os.path.basename(encrypted_filepath)

    encrypted_file_data = {
        "email": email,
        "token": token,
        "filename": original_filename,
        "encrypted_filename": encrypted_filename,
        "created_at": datetime.datetime.utcnow(),
    }

    try:
        encrypted_files_collection.insert_one(encrypted_file_data)
        return jsonify({"message": "File encrypted successfully", "encrypted_file": encrypted_filename}), 201
    except Exception as e:
        return jsonify({"error": f"Database error: {str(e)}"}), 500

# Decrypt Route
@app.route("/decrypt", methods=["POST"])
def decrypt():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    email, token = request.form.get("email"), request.form.get("token")

    if not email or not token:
        return jsonify({"error": "Missing email or token"}), 400

    filepath = os.path.join(ENCRYPTED_FOLDER, file.filename)
    file.save(filepath)

    key = load_key()
    decrypted_filepath = decrypt_file(filepath, key)

    if not decrypted_filepath:
        return jsonify({"error": "Decryption failed. Invalid key or corrupted file."}), 400

    return send_file(decrypted_filepath, as_attachment=True)

# Verify User Route
@app.route("/verify-user", methods=["POST"])
def verify_user():
    try:
        data = request.get_json()
        email, token = data.get("email"), data.get("token")

        if not email or not token:
            return jsonify({"error": "Email and token are required."}), 400

        user = users_collection.find_one({"email": email})

        if user:
            stored_token = user.get("token")

            if stored_token.strip() == token.strip():
                return jsonify({"message": "User verified successfully!"}), 200
            else:
                return jsonify({"error": "Invalid token."}), 401
        else:
            return jsonify({"error": "Invalid email."}), 401

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
