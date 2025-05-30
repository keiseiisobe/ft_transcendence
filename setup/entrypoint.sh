#!/bin/bash

echo "entrypoint.sh"
echo "user: $(whoami)"

workdir="usr/share/elasticsearch"
# Healthcheckスクリプトを実行
echo "[Entrypoint] 証明書チェック開始..."
/usr/share/scripts/healthcheck.sh
# healthcheck.shの結果が1（異常）なら証明書作り直し
if [[ $? -ne 0 ]]; then
	echo "証明書が不足しているため作り直します";
	rm -rf config/certs/*;
	sh /usr/share/scripts/elasticstack.sh;
	#sh services.sh;
fi

echo "Setting file permissions"

echo "Waiting for Elasticsearch availability";
until curl -s --cacert config/certs/ca/ca.crt https://es01:9200 | grep -q "missing authentication credentials"; do sleep 3; done;
	
echo "Setting snapshot repository";
# generate snapshot repository
curl -X PUT https://es01:9200/_snapshot/archive-backup \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H 'Content-Type: application/json' \
  -d '{
  	"type": "fs",
  	"settings": {
  	  "location": "/usr/share/elasticsearch/archive-backup"
  	}
  }'
echo "Setting snapshot lifecycle policy";
# generate snapshot lifecycle policy
sh /usr/share/scripts/generate_snapshot_lifecycle_policy.sh
echo "Setting index lifecycle policy";
#index lifecycle policy
sh /usr/share/scripts/generate_index_lifecycle_policy.sh

echo "Setting kibana_system password";
until curl -s -X POST --cacert config/certs/ca/ca.crt -u "elastic:${ELASTIC_PASSWORD}" -H "Content-Type: application/json" https://es01:9200/_security/user/kibana_system/_password -d "{\"password\":\"${KIBANA_PASSWORD}\"}" | grep -q "^{}"; do sleep 3; done;

echo
echo "Setting kibana dashboard";
/usr/share/scripts/setup-kibana-dashboard.sh;
/usr/share/scripts/kibana-create-user.sh

echo
echo "user: $(whoami)";
echo "\ngrafana create users";
until curl -s -u "kousuzuk:kousuzuk42!" http://grafana:3000/api/health | grep -q "ok"; do sleep 3; done;
/usr/share/scripts/create_org.sh;
/usr/share/scripts/create_user.sh;


echo "All done!";
