#!/bin/sh
cp /certs/service-certificates/ca.crt /etc/ssl/certs/ca.crt
cp /certs/service-certificates/elasticsearch-exporter.crt /etc/ssl/certs/elasticsearch-exporter.crt
cp /certs/service-certificates/elasticsearch-exporter.key /etc/ssl/certs/elasticsearch-exporter.key
rm -f /certs/service-certificates/elasticsearch-exporter*

/bin/elasticsearch_exporter \
			--es.uri=https://es01:9200 \
			--es.ca=/etc/ssl/certs/ca.crt \
			--es.client-private-key=/etc/ssl/private/elasticsearch-exporter.key \
			--es.client-cert=/etc/ssl/certs/elasticsearch-exporter.crt \
			--es.all
			#--log.level=debug
