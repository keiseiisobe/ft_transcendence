# syntax=docker/dockerfile:1
FROM python:3

ENV NODE_VERSION=23.7.0
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN mkdir /project
WORKDIR /project

COPY --chmod=755 docker-entrypoint.sh wait-for-it.sh . 

COPY requirements.txt .
RUN pip install -r requirements.txt
RUN pip install psycopg2 uwsgi

COPY pong-3D ./pong-3D
RUN npm --prefix pong-3D install
RUN npm --prefix pong-3D run build

COPY accounts ./accounts
COPY friendship ./friendship
COPY games ./games
COPY pong ./pong
COPY manage.py .

ENTRYPOINT ["./docker-entrypoint.sh"]
