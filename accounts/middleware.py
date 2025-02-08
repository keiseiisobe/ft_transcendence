import jwt
from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import logout

User = get_user_model()  # ここでカスタムユーザーモデルを取得

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        access_token = request.COOKIES.get("jwt_access")
        refresh_token = request.COOKIES.get("jwt_refresh")

        if not access_token:
            self.set_user_logout(request)
            return

        try:
            payload = jwt.decode(access_token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload["id"])
            request.user = user
            request.user.is_login = True
            request.user.save(update_fields=["is_login"])  # is_login を True に更新

        except jwt.ExpiredSignatureError:
            # アクセストークンが失効した場合は is_login = False にする
            self.set_user_logout(request)

            if refresh_token:
                try:
                    refresh_payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
                    user = User.objects.get(id=refresh_payload["id"])

                    new_access_exp = datetime.utcnow() + timedelta(seconds=30)  # 30秒
                    new_payload_access = {
                        "id": user.id,
                        "username": user.username,
                        "exp": new_access_exp,
                        "iat": datetime.utcnow()
                    }
                    new_access_token = jwt.encode(new_payload_access, settings.SECRET_KEY, algorithm="HS256")

                    request.user = user
                    request.user.is_login = True
                    request.user.save(update_fields=["is_login"])  # is_login を True に更新

                    # Cookie を更新
                    request.COOKIES["jwt_access"] = new_access_token

                except jwt.ExpiredSignatureError:
                    self.set_user_logout(request)  # リフレッシュトークンも失効していたらログアウト処理
                except jwt.DecodeError:
                    self.set_user_logout(request)

            else:
                self.set_user_logout(request)

        except (jwt.DecodeError, User.DoesNotExist):
            self.set_user_logout(request)

    def set_user_logout(self, request):
        if request.user and hasattr(request.user, "id"):
            try:
                user = User.objects.get(id=request.user.id)
                user.is_login = False
                user.save(update_fields=["is_login"])
            except User.DoesNotExist:
                pass  # ユーザーが存在しない場合は何もしない
        request.user = None  # Djangoの匿名ユーザーにする
