#!/usr/bin/env bash

./wait-for-it.sh db:5432 --timeout=30 --strict -- echo "Postgres is up"
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
