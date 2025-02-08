# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /project
COPY requirements.txt /project/
RUN pip install -r requirements.txt; \
    pip install -U 'channels[daphne]'; \
    pip install django-friendship \
    		django-rainbowtests \
		Pillow \
		"selenium >= 4.8.0"; \
		pip install PyJWT
COPY . /project/
