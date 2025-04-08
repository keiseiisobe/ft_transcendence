#!/bin/bash

echo "elasticstack.sh"
#workdir="usr/share/elasticsearch"
if [ x${ELASTIC_PASSWORD} == x ]; then
  echo "Set the ELASTIC_PASSWORD environment variable in the .env file";
  exit 1;
elif [ x${KIBANA_PASSWORD} == x ]; then
  echo "Set the KIBANA_PASSWORD environment variable in the .env file";
  exit 1;
fi;
if [ ! -f config/certs/ca.zip ]; then
  echo "Creating CA";
  whoami;
  ls -la config;
  bin/elasticsearch-certutil ca --silent --pem -out config/certs/ca.zip;
  unzip config/certs/ca.zip -d config/certs;
fi;
if [ ! -f config/certs/certs.zip ]; then
  echo "Creating certs";
  bin/elasticsearch-certutil cert --silent --pem -out config/certs/certs.zip --in elasticstack-certificates.yml --ca-cert config/certs/ca/ca.crt --ca-key config/certs/ca/ca.key;
  unzip config/certs/certs.zip -d config/certs;
fi;
