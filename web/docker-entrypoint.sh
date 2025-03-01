#!/usr/bin/env bash

./wait-for-it.sh db:5432 --timeout=30 --strict -- echo "Postgres is up"
python manage.py migrate
python manage.py collectstatic --noinput --clear
uwsgi --ini games/uwsgi.ini --module games.wsgi
