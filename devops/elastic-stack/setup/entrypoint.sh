#!/bin/bash

workdir="usr/share/elasticsearch"
# Healthcheckスクリプトを実行
echo "[Entrypoint] 証明書チェック開始..."
/usr/share/scripts/healthcheck.sh
# healthcheck.shの結果が1（異常）なら証明書作り直し
if [[ $? -ne 0 ]]; then
	echo "証明書が不足しているため作り直します";
	rm -rf config/certs/*
	sh /usr/share/scripts/elasticstack.sh;
	#sh services.sh;
fi
#echo "ls"
#ls -R config/certs

echo "Setting file permissions"
chown -R root:root config/certs;
#chown -R root:root config/certs/service-certificates;
find . -type d -exec chmod 750 \{\} \;;
find . -type f -exec chmod 640 \{\} \;;

echo "Waiting for Elasticsearch availability";
until curl -s --cacert config/certs/ca/ca.crt https://es01:9200 | grep -q "missing authentication credentials"; do sleep 3; done;
	
echo "Setting kibana_system password";
until curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://es01:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 3; done;

echo "Setting kibana dashboard";
/usr/share/scripts/setup-kibana-dashboard.sh;


echo "All done!";
sleep 60;
