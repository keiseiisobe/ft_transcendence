# create index policy
#echo "Creating index template"
#curl -X PUT "https://es01:9200/_index_template/logs-postgresql" \
#  --cacert /usr/share/elastic-agent/certs/ca/ca.crt \
#  -u elastic:changeme \
#  -H "Content-Type: application/json" \
#  -d '{
#    "index_patterns": [".ds-logs-postgresql*"],
#    "priority": 500,
#    "template": {
#      "settings": {
#        "index.lifecycle.name": "postgresql_log_policy",
#      }
#    },
#    "data_stream": {}
#  }'

# create snapshot repository
#echo "Creating snapshot repository"
#curl -X PUT "https://es01:9200/_snapshot/local-backup" \
#  --cacert /usr/share/elastic-agent/certs/ca/ca.crt \
#  -u elastic:changeme \
#  -H "Content-Type: application/json" \
#  -d '{
#	"type": "fs",
#	"settings": {
#	  "location": "/mnt/es-backup"
#	}
#  }'

#create ILM policy
echo "Creating ILM policy"
curl -X PUT "https://es01:9200/_ilm/policy/postgresql_log_policy" \
  --cacert /usr/share/elastic-agent/certs/ca/ca.crt \
  -u elastic:changeme \
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
  --cacert /usr/share/elastic-agent/certs/ca/ca.crt \
  -u elastic:changeme \
  -H "Content-Type: application/json" \
  -d '{
    "template":{
      "settings":{
        "index": {
          "lifecycle": {
            "name": "postgresql_log_policy",
			"rollover_alias": "logs-postgresql.log-default"
          }
        }	
      },
	  "lifecycle": {
    	"data_retention": "2m"
	  }
    }
  }'

#echo "\nAssigning ILM policy to index"
#curl -X PUT "https://es01:9200/.ds-logs-postgresql*/_settings" \
#  --cacert /usr/share/elastic-agent/certs/ca/ca.crt \
#  -u elastic:changeme \
#  -H "Content-Type: application/json" \
#  -d '{
#    "index.lifecycle.name": "postgresql_log_policy"
#  }'


#curl -X PUT "https://es01:9200/_index_template/.ds-logs-postgresql*" \
#  --cacert /usr/share/elastic-agent/certs/ca/ca.crt \
#  -u elastic:changeme \
#  -H "Content-Type: application/json" \
#  -d '{
#    "index_patterns": ["logs-postgresql*"],
#    "data_stream": {},
#    "template": {
#      "settings": {
#        "index.lifecycle.name": "postgresql_log_policy"
#      }
#    }
#  }'
