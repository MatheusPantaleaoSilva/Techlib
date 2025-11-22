from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt
from flask import jsonify

def role_required(*roles):
    """
    Decorator para proteger rotas por role.
    Exemplo:
    @role_required("FUNCIONARIO")
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
                claims = get_jwt()
                if claims.get("role") not in roles:
                    return jsonify({"msg": "Acesso negado"}), 403
            except Exception:
                return jsonify({"msg": "Token inválido ou ausente"}), 401
            return fn(*args, **kwargs)
        return wrapper
    return decorator
