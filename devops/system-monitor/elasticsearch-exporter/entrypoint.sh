#!/bin/sh
echo "user: $(whoami)"
echo "entrypoint.sh"
cp /certs/ca/ca.crt /etc/ssl/certs/ca.crt

/bin/elasticsearch_exporter \
			--es.uri=https://elastic:${ELASTIC_PASSWORD}@es01:9200 \
			--es.ca=/etc/ssl/certs/ca.crt \
			--es.all \
			--log.level=debug
