from marshmallow import Schema, fields, validate
import datetime

# User Schema for Request Validation
class UserSchema(Schema):
    name = fields.String(required=True)
    email = fields.Email(required=True)
    password = fields.String(required=False, validate=validate.Length(min=6))
    picture = fields.String(
        required=False,
        default="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png"
    )

    class Meta:
        unknown = "exclude"

# Schema for user registration
class RegisterSchema(Schema):
    name = fields.String(required=True)
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

# Schema for user login
class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))

# Encrypted File Schema
class EncryptedFileSchema(Schema):
    email = fields.Email(required=True)
    filename = fields.String(required=True)
    encrypted_filename = fields.String(required=True)
    date_encrypted = fields.DateTime(default=datetime.datetime.utcnow)
    token = fields.String(required=True)

    class Meta:
        unknown = "exclude"
