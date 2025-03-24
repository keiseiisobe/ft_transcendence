#!/bin/bash

workdir="usr/share/elasticsearch"

# check existence of the elasticstack certificates
CRT_COUNT=$(ls -1 config/certs/*/*.crt 2>/dev/null | wc -l)
if [[ "$CRT_COUNT" -ne 6 ]]; then # 6 files expected (ca + elasticsearch + kibana + logstash + apm-server + elastic-agent)
  echo "Elasticstack certificates not found"
  exit 1
fi

echo "Certificates check passed"
exit 0
