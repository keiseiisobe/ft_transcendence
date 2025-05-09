#!/bin/bash

echo "entrypoint.sh"
echo "user: $(whoami)"

CERTS_DIR="/usr/share/logstash/config/certs"

if [ -d "/certs/logstash" ]; then
	rm -f "$CERTS_DIR/*"
	echo "Removed."

	mkdir -p $CERTS_DIR
	cp /certs/ca/ca.crt $CERTS_DIR/ca.crt
	cp /certs/logstash/logstash.crt $CERTS_DIR/logstash.crt
	cp /certs/logstash/logstash.key $CERTS_DIR/logstash.key
fi

ls -la $CERTS_DIR
chown -R logstash:logstash $CERTS_DIR


logstash -f /usr/share/logstash/pipeline/logstash.conf
