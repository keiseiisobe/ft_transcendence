# syntax=docker/dockerfile:1
FROM python:3
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /project
COPY requirements.txt /project/
RUN pip install -r requirements.txt
RUN pip install django-bootstrap-customizer
COPY . /project/
