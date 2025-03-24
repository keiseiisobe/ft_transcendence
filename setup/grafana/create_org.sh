#!/bin/bash
curl -X POST -u kousuzuk:kousuzuk42! -H "Accept: application/json" -H "Content-Type: application/json" -d '{
  "name":"ft_transcendence Org"
}' http://grafana:3000/api/orgs

# to Ensure that the org is created before creating the users
curl GET -u kousuzuk:kousuzuk42! -H "Accept: application/json" -H "Content-Type: application/json" http://grafana:3000/api/orgs


