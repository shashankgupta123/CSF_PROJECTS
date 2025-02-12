from mongoengine import Document, StringField, DateTimeField
import datetime

# MongoDB User Model
class User(Document):
    name = StringField(required=True)
    email = StringField(required=True, unique=True)
    password = StringField(required=False, min_length=6)
    picture = StringField(default="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png")
    created_at = DateTimeField(default=datetime.datetime.utcnow)
    token = StringField(required=False)

    meta = {'collection': 'users'}

# MongoDB Encrypted File Model
class EncryptedFile(Document):
    email = StringField(required=True)
    filename = StringField(required=True)
    encrypted_filename = StringField(required=True)
    date_encrypted = DateTimeField(default=datetime.datetime.utcnow)
    token = StringField(required=True)

    meta = {'collection': 'encrypted_files'}
