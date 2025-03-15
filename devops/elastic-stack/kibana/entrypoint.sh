#!/bin/bash

mkdir -p /usr/share/kibana/config/certs
if [ -f /certs/kibana/kibana.crt ]; then
	rm -f /usr/share/kibana/config/certs/*
	cp /certs/ca/ca.crt /usr/share/kibana/config/certs/ca.crt
	cp /certs/kibana/kibana.crt /usr/share/kibana/config/certs/kibana.crt
	cp /certs/kibana/kibana.key /usr/share/kibana/config/certs/kibana.key
	rm -rf /certs/kibana
fi
ls -la /usr/share/kibana/config/certs

exec gosu kibana /usr/local/bin/kibana-docker

