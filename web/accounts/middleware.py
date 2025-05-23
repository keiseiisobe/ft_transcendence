import jwt
from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model, logout
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth.models import AnonymousUser
from .jwt_utils import decode_jwt, generate_jwt
from friendship.models import Follow, bust_cache
from django.shortcuts import render

User = get_user_model()
EXCLUDED_PATHS = [
  '/',
  '/pong',
  '/pong/',
  '/pong/ssr/index',
  '/accounts/signup/',
  '/accounts/login/',
  '/accounts/logout/',
  '/accounts/user',
  '/accounts/user/',
  '/accounts/verify-totp-code',
  '/accounts/verify-totp-code/',
  '/matches/new',
  '/matches/tournaments/new',
  '/metrics'
]

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        if request.path in EXCLUDED_PATHS:
            return
        if request.path.startswith('/matches/'):
            return
        access_token = request.COOKIES.get(settings.ACCESS_TOKEN_KEY)
        refresh_token = request.COOKIES.get(settings.REFRESH_TOKEN_KEY)

        if access_token:
            try:
                payload = decode_jwt(access_token)
                user = User.objects.get(id=payload["user_id"])
                request.user = user
                return
            except jwt.ExpiredSignatureError:
                # need to refresh token
                pass
            except (jwt.DecodeError, User.DoesNotExist):
                self.set_user_logout(request)
                return

        if refresh_token:
            try:
                payload = decode_jwt(refresh_token)
                if payload.get("type") != "refresh":
                    raise jwt.InvalidTokenError()
                user = User.objects.get(id=payload["user_id"])
                request.user = user
                # create new access token
                new_access_token = generate_jwt({'user_id': user.id}, settings.ACCESS_TOKEN_LIFETIME)
                request.new_access_token = new_access_token
                return
            except (jwt.ExpiredSignatureError, jwt.DecodeError, jwt.InvalidTokenError, User.DoesNotExist):
                self.set_user_logout(request)
                return
        self.set_user_logout(request)

    def process_response(self, request, response):
        if hasattr(request, 'new_access_token'):
            access_token_lifetime = settings.ACCESS_TOKEN_LIFETIME
            access_expiry = datetime.utcnow() + access_token_lifetime
            response.set_cookie(
                settings.ACCESS_TOKEN_KEY,
                request.new_access_token,
                httponly=True,
                secure=True,
                samesite='Lax',
                expires=access_expiry
            )
        # delete cookie on logout
        if getattr(request, 'clear_jwt_cookies', False):
            print('aaaaaaaaaaaaaaaaaaaaaaaaaaa')
            print('aaaaaaaaaaaaaaaaaaaaaaaaaaa')
            print(request.path)
            print('aaaaaaaaaaaaaaaaaaaaaaaaaaa')
            print('aaaaaaaaaaaaaaaaaaaaaaaaaaa')
            response = render(request, 'pong/index.html', status=401)
            response.delete_cookie(settings.ACCESS_TOKEN_KEY)
            response.delete_cookie(settings.REFRESH_TOKEN_KEY)
        return response

    def set_user_logout(self, request):
        if request.user and hasattr(request.user, "id"):
            try:
                user = User.objects.get(id=request.user.id)
                user.is_login = False
                user.save(update_fields=["is_login"])
                for user in Follow.objects.followers(request.user):
                    bust_cache("following", user.pk)
                logout(request)
            except User.DoesNotExist:
                pass
            except Exception as e:
                print('error:', e)
        request.user = AnonymousUser()
        request.clear_jwt_cookies = True
