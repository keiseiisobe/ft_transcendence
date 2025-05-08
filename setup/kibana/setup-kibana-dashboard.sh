#!/bin/bash

# import the dashboard into kibana

# wait for kibana to be up
until curl -s --cacert /usr/share/elasticsearch/config/certs/ca/ca.crt -u elastic:${ELASTIC_PASSWORD} -I https://kibana:5601 | grep -q 'HTTP/1.1 302 Found'; do sleep 3; done;

#check if the dashboard already exists
if ! curl -sX GET --cacert /usr/share/elasticsearch/config/certs/ca/ca.crt \
  -u elastic:${ELASTIC_PASSWORD} \
  "https://kibana:5601/api/saved_objects/_find?type=dashboard&fields=title" \
  -H "kbn-xsrf: true" | grep -q "nginx_dashboard"; then
	# import the dashboard into kibana
	echo "\nimport the dashboard into kibana"
	curl \
	  -X POST https://kibana:5601/api/saved_objects/_import?createNewCopies=true \
	  --cacert /usr/share/elasticsearch/config/certs/ca/ca.crt \
	  -u elastic:${ELASTIC_PASSWORD} \
	  -H "kbn-xsrf: true" \
	  --form file=@/usr/share/elasticsearch/nginx_dashboard.ndjson
fi
