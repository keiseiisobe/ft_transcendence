#!/bin/bash

echo "entrypoint.sh"
# generate snapshot repository
curl -XPUT https://es01:9200/_snapshot/archive-backup \
curl -X PUT https://es01:9200/_snapshot/archive-backup \
  --cacert /usr/share/elastic-agent/certs/ca/ca.crt \
  -u elastic:changeme \
  -H 'Content-Type: application/json' \
  -d '{
  	"type": "fs",
  	"settings": {
  	  "location": "/usr/share/elasticsearch/archive-backup"
  	}
  }'
# generate snapshot lifecycle policy
sh /usr/local/bin/generate_snapshot_lifecycle_policy.sh
#index lifecycle policy
sh /usr/local/bin/generate_index_lifecycle_policy.sh


response=$(curl -s --cacert /usr/share/elastic-agent/certs/ca/ca.crt -u elastic:changeme  -X POST "https://es01:9200/_security/api_key" -H "Content-Type: application/json" -u "elastic:changeme" -d '{"name": "my_api_key", "role_descriptors": {"standalone_agent": {"cluster": ["monitor", "manage_api_key", "manage_own_api_key", "manage_index_templates"],"index": [{"names": ["*"],"privileges": ["all"]}]}}}')

echo "$response"

api_key=$(echo "$response" | sed -n 's/.*"encoded":"\([^"]*\)".*/\1/p')

sed -i "s/\${API_KEY}/$api_key/" /usr/share/elastic-agent/elastic-agent.yml

if dpkg -l | grep -q "elastic-agent"; then
    echo "Elastic Agentは既にインストールされています。"
else
    echo "Elastic Agentをダウンロードしてインストールします..."
    curl -L -O https://artifacts.elastic.co/downloads/beats/elastic-agent/elastic-agent-8.17.2-arm64.deb
    dpkg -i elastic-agent-8.17.2-arm64.deb
    echo "Elastic Agentのインストールが完了しました。"
fi

#chmod -w /etc/elastic-agent/elastic-agent.yml

cp -f /usr/share/elastic-agent/elastic-agent.yml /etc/elastic-agent/elastic-agent.yml

#cat /etc/elastic-agent/elastic-agent.yml


echo "run elstic-agent"
/usr/bin/elastic-agent run -e -d "*"
