# syntax=docker/dockerfile:1
FROM python:3

# 環境変数設定
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 作業ディレクトリ設定
WORKDIR /project

# 依存関係をコピー
COPY requirements.txt /project/

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    chromium \
    chromium-driver && \
    rm -rf /var/lib/apt/lists/*

# Python パッケージのインストール
RUN pip install -r requirements.txt && \
    pip install -U 'channels[daphne]' && \
    pip install django-friendship \
                django-rainbowtests \
                Pillow \
                "selenium >= 4.8.0" \
                webdriver-manager \
                chromedriver-binary-auto

# Chromium の環境変数
ENV CHROME_BIN=/usr/bin/chromium
ENV CHROME_DRIVER=/usr/bin/chromedriver
ENV PATH=$PATH:/usr/bin

# アプリケーションファイルをコピー
COPY . /project/
