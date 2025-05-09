curl -X PUT "https://es01:9200/_slm/policy/archive_snapshot" \
  --cacert config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  -H "Content-Type: application/json" \
  -d '{
	"schedule": "0 0 0 * * ?", 
    "name": "<archive-snap-{now/d}>", 
    "repository": "archive-backup", 
    "config": { 
      "ignore_unavailable": false,
      "include_global_state": false
    },
    "retention": { 
      "expire_after": "30d", 
      "min_count": 5, 
      "max_count": 50 
    }
  }'
