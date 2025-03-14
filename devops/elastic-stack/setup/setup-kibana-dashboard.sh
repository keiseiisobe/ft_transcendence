#!/bin/bash

# import the dashboard into kibana

# wait for kibana to be up
until curl -s --cacert /usr/share/elasticsearch/config/certs/ca/ca.crt -u elastic:changeme -I http://kibana:5601 | grep -q 'HTTP/1.1 302 Found'; do sleep 3; done;
# import the dashboard into kibana
echo "\nimport the dashboard into kibana"
curl \
  -X POST http://kibana:5601/api/saved_objects/_import?createNewCopies=true \
  -u elastic:changeme \
  -H "kbn-xsrf: true" \
  --form file=@/usr/share/elasticsearch/nginx_dashboard.ndjson
