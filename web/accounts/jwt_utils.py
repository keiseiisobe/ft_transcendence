import jwt
from django.conf import settings
from datetime import datetime
from django.http import JsonResponse
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError

def generate_jwt(payload, lifetime):
    exp = datetime.utcnow() + lifetime
    payload.update({"exp": exp})
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token

def decode_jwt(token):
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])

def create_token_response(user_id, message):
    response = JsonResponse({'message': message})
    # access_token
    access_token_lifetime = settings.ACCESS_TOKEN_LIFETIME
    access_token = generate_jwt({'user_id': user_id}, access_token_lifetime)
    access_expiry = datetime.utcnow() + access_token_lifetime
    response.set_cookie(
      settings.ACCESS_TOKEN_KEY,
      access_token,
      httponly=True,
      secure=True,
      samesite='Lax',
      expires=access_expiry
    )
    # refresh_token
    refresh_token_lifetime = settings.REFRESH_TOKEN_LIFETIME
    refresh_token = generate_jwt({'user_id': user_id, 'type': 'refresh'}, refresh_token_lifetime)
    refresh_expiry = datetime.utcnow() + refresh_token_lifetime
    response.set_cookie(
      settings.REFRESH_TOKEN_KEY,
      refresh_token,
      httponly=True,
      secure=True,
      samesite='Lax',
      expires=refresh_expiry
    )
    return response

def delete_token_response(message):
    response = JsonResponse({'message': message})
    response.delete_cookie(settings.ACCESS_TOKEN_KEY)
    response.delete_cookie(settings.REFRESH_TOKEN_KEY)
    return response
