# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /project
COPY requirements.txt /project/
RUN pip install -r requirements.txt
RUN pip install django-friendship
RUN python -m pip install Pillow
RUN python -m pip install -U 'channels[daphne]'
COPY . /project/
