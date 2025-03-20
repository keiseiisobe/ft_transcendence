#create ILM policy
echo "Creating ILM policy"
curl -X PUT "https://es01:9200/_ilm/policy/custom_log_policy" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
    "policy": {
      "phases": {
        "hot": {
          "actions": {
            "rollover": {
              "max_age": "5m"
            }
          }
        },
        "delete": {
          "min_age": "2m",
          "actions": {
          	"wait_for_snapshot" : {
            	"policy": "archive_snapshot"
        	}
          }
        }
      }
    }
  }'

# add component_template to logs@custom
echo "add component_template to logs@custom"
curl -X PUT "https://es01:9200/_component_template/logs@custom" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
    "template":{
    	"settings":{
			"number_of_shards": 1,
    		"number_of_replicas": 0,
        	"index": {
          		"lifecycle": {
            		"name": "custom_log_policy"
          		}
        	}	
    	}
    }
}'	

# create Index Template
echo "Creating Index Template"
curl -XPUT -H 'Content-Type: application/json' --cacert config/certs/ca/ca.crt -u elastic:${ELASTIC_PASSWORD} https://es01:9200/_index_template/nginx_index_template -d '
{
    "index_patterns": ["logstash-nginx-*"],
"template": {
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "index.lifecycle.name": "custom_log_policy",
		"index.lifecycle.rollover_alias": "logstash-nginx"
    }
},
"priority": 500,
"composed_of": ["logs@custom"],
"version": 3,
"_meta": {
"description": "my custom"
}
}'

curl -XPUT -H 'Content-Type: application/json' --cacert config/certs/ca/ca.crt -u elastic:${ELASTIC_PASSWORD} https://es01:9200/_index_template/postgresql_index_template -d '
{
    "index_patterns": ["logstash-postgresql-*"],
"template": {
    "settings": {
        "number_of_shards": 1,
        "number_of_replicas": 0,
        "index.lifecycle.name": "custom_log_policy",
		"index.lifecycle.rollover_alias": "logstash-postgresql"
    }
},
"priority": 500,
"composed_of": ["logs@custom"],
"version": 3,
"_meta": {
"description": "my custom"
}
}'

until curl -X GET "https://es01:9200/_index_template/nginx_index_template" --cacert config/certs/ca/ca.crt -u elastic:${ELASTIC_PASSWORD}; do
  sleep 1
done

echo "create index"
curl -X PUT "https://es01:9200/logstash-nginx-000001" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
  "aliases": {
	"logstash-nginx": {
	  "is_write_index": true
	}
  }
}'

until curl -X GET "https://es01:9200/_index_template/postgresql_index_template" --cacert config/certs/ca/ca.crt -u elastic:${ELASTIC_PASSWORD}; do
  sleep 1
done
curl -X PUT "https://es01:9200/logstash-postgresql-000001" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
  "aliases": {
	"logstash-postgresql": {
	  "is_write_index": true
	}
  }
}'



echo "Create alias"
curl -XPOST "https://es01:9200/_aliases" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
  "actions": [
	{
	  "add": {
		"index": "<logstash-nginx-000001>",
		"alias": "logstash-nginx",
		"is_write_index": true
	  }
	}
  ]
}'

curl -XPOST "https://es01:9200/_aliases" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
  "actions": [
	{
	  "add": {
		"index": "logstash-postgresql-000001",
		"alias": "logstash-postgresql",
		"is_write_index": true
	  }
	}
  ]
}'
