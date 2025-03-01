#!/bin/sh

apt-get update && apt-get install -y openssl

openssl req -x509 -nodes \
    -out /etc/ssl/certs/localhost.crt \
    -keyout /etc/ssl/private/localhost.key \
    -subj "/C=JP/ST=TYO/L=Tokyo/O=42/OU=42/CN=localhost"

apt remove -y openssl
