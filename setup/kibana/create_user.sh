#!/bin/bash

curl -X POST -u elastic:${ELASTIC_PASSWORD} --cacert /usr/share/elasticsearch/config/certs/ca/ca.crt -H "Content-Type: application/json" -d '{
	"password": "Viewer4242!!",
	"roles": ["Viewer"],
	"full_name": "Viewer",
	"email": "viewer@example.com",
	"metadata": {
		"intelligence" : 7
	}
}' https://es01:9200/_security/user/viewer

