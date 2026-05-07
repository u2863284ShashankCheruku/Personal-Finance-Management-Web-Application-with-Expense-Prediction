from flask_bcrypt import generate_password_hash, check_password_hash

def hash_password(password):
    # Hash password with salt using bcrypt for secure storage
    return generate_password_hash(password).decode('utf-8')

def verify_password(password, hashed):
    # Compare plain password with stored hashed password
    return check_password_hash(hashed, password)