#!/bin/bash
echo "entrypoint.sh"
echo "user: $(whoami)"

CERTS_DIR="/usr/share/elastic-agent/certs"

mkdir -p $CERTS_DIR
cp /certs/ca/ca.crt $CERTS_DIR/ca.crt
cp /certs/elastic-agent/elastic-agent.crt $CERTS_DIR/elastic-agent.crt
cp /certs/elastic-agent/elastic-agent.key $CERTS_DIR/elastic-agent.key
rm -rf /certs/elastic-agent

echo "run elstic-agent"
elastic-agent run -e -d "*"
