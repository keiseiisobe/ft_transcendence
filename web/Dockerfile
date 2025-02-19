# syntax=docker/dockerfile:1
FROM python:3

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY . /project/
WORKDIR /project

RUN pip install -r requirements.txt
RUN chmod +x docker-entrypoint.sh
RUN chmod +x wait-for-it.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
