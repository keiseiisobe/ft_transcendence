#!/bin/bash

workdir="usr/share/elasticsearch"
#if [ "${CERTS_CREATED:-false}" = "true" ]; then
#  echo "Certificates already created"
#  # 環境変数がtrueの場合は終了
#  exit 0
#fi

# check existence of the elasticstack certificates

CRT_COUNT=$(ls -1 config/certs/*/*.crt 2>/dev/null | wc -l)
if [[ "$CRT_COUNT" -ne 6 ]]; then # 6 files expected (ca + elasticsearch + kibana + logstash + apm-server + elastic-agent)
  echo "Elasticstack certificates not found"
  exit 1
fi

#CRT_COUNT=$(ls -1 config/certs/service-certificates/*.crt 2>/dev/null | wc -l)
# check existence of the other service certificates
#if [[ "$CRT_COUNT" -ne 10 ]]; then # 4 files expected (ca + nginx + prometheus + grafana )
#  echo "Service certificates not found"
#  exit 1
#fi

#export CERTS_CREATED=true
echo "Certificates check passed"
exit 0
