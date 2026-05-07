from flask_jwt_extended import verify_jwt_in_request
from functools import wraps

def jwt_required_custom(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # Ensure request contains valid JWT token
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper