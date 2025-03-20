CERTS_DIR="/usr/share/elasticsearch/config/certs"
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
              "max_size": "100KB",
              "max_age": "10m"
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
echo "\nadd component_template to logs@custom"
curl -X PUT "https://es01:9200/_component_template/logs@custom" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
    "template":{
      "settings":{
        "index": {
          "lifecycle": {
            "name": "custom_log_policy",
			"rollover_alias": "logs-postgresql.log-default"
          }
        }	
      },
	  "lifecycle": {
    	"data_retention": "2m"
	  }
    }
  }'

