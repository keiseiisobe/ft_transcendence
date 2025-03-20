# How To Build

1.  execute "docker compose up" at the root project directory
2.  If you can't, execute "sudo chown -R $USER:$USER games manage.py; sudo chmod -R 777 data".

# Design

* Google Drawings:
  - https://docs.google.com/drawings/d/10wUYA-RW9O3L8RCU4kKkAk1KcqOjuABCIes1RMlzLFQ/edit?usp=sharing

* figma
  - https://www.figma.com/design/MiDiaoFDUuOb4aEGGjzNcA/pong-game?node-id=0-1&t=47vmdUqikmOEhxHB-1

# Reference sites:

* Javascript:
  - http://vanilla-js.com/
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript

* Ruby:
  - https://docs.ruby-lang.org/en/master/

* Django:
  - https://docs.djangoproject.com/en/5.1/intro/tutorial01/
  - https://wiki.python.org/moin/WebFrameworks
  - https://asgi.readthedocs.io/en/latest/introduction.html

* PostgreSQL:
  - https://www.postgresql.org/docs/current/

* Docker:
  - https://github.com/docker/awesome-compose/tree/master/official-documentation-samples/django/


## DevOps

### major module: Elastic Stack
#### Components
- Elasticsearch
- Kibana
- Logstash
- Elastic-agent
##### +a
- apm-server: Elastic APM( for monitoring django)
#### requirements
- Deploy Elasticsearch to efficiently store and index log data, making it easilysearchable and accessible.
	- efficiently store setting: Create an ILM (Index Lifecycle Policy) in the setup container via generate_index_lifecycle_policy.sh.
	- index log data: The Elastic-agent collects the log data and sends it to Elasticsearch (or Logstash).
		https://localhost:5601/app/management/data/index_management/indices
	- making it easilysearchable and accessible: You can search from Discover in Kibana
- Configure Logstash to collect, process, and transform log data from various sources and send it to Elasticsearch.
	- various sources: here Elastic-agent only. because Elastic-agent can collect to various sources(such as nginx, postgresql, django etc.)
	- transform log data
		- nginx log: generate geometry info from IP address.
		```conf:elastic-agent_pipeline.conf
			grok {
		  		match => { "message" => "%{COMBINEDAPACHELOG}"}  
		  	}
			# ① プライベート IP の場合のみ `public_ip` を設定
		    translate {
		        field => "[source][address]"
		        destination => "[source][address]"
		        dictionary => {
		          "192.168.100.1" => "207.65.243.55"
		        }
		        override => true
		    }
		    # ② `public_ip` が存在する場合のみ `geoip` を適用
			geoip {
				source => "[source][address]"
				target => "geoip"
			}
		```
		- postgresql log: devide data to each field from message
		```conf:elastic-agent_pipeline.conf
		  	grok {
		  	  	match => {
		  	  	  	"message" => "%{TIMESTAMP_ISO8601:timestamp} %{WORD:timezone} \[%{NUMBER:pid}\] user=%{USERNAME:user},db=%{USERNAME:database},app=%{DATA:app} %{LOGLEVEL:loglevel}:  statement: %{GREEDYDATA:query}"
		  	  	}
		  	}
		```
	- send to Elasticsearch
	```conf:elastic-agent_pipeline.conf
	output {
		...
		elasticsearch { 
  	    	index => "logstash-nginx-%{+YYYY.MM.dd}"
    	    hosts=> "${ELASTIC_HOSTS}"
    	    user=> "${ELASTIC_USER}"
    	    password=> "${ELASTIC_PASSWORD}"
    	    ssl_certificate_authorities=> "/usr/share/logstash/certs/ca/ca.crt"
		}
		...
	}
	```
- Set up Kibana for visualizing log data, creating dashboards, and generating insights from log events.
	- Set up Kibana for visualizing log data: build kibana and Elasticsearch, datasource service
	- creating dashboards:
		-  to see https://localhost:5601/app/dashboards (Since the access log to pong is used, it will not be displayed unless a request is sent to pong once)
		- configure using Kibana API in setup/kibana/setup-kibana-dashboard.sh.
		- dashboard file\: setup/kibana/kibana-dashboards/\*.ndjson
- Define data retention and archiving policies to manage the storage of log data effectively.
	- data retension: Update logs@custom, one of the component_templates.
		```shell
	  "lifecycle": {
    	"data_retention": "2m"
	  }
		```
	- archiving policies: 
- Implement security measures to protect log data and access to the ELK stack components.
	- TLS
		- between browser to KIbana.
		- between Kibana to Elasticsearch.
	- Role
		- admin: elastic:changeme
		- viewer: viewer:Viewer4242!!
	- password 
### minor module: Monitoring system
#### Components
- Prometheus
- Grafana
- alertmanager
- Thanos
	- receiver
	- query
	- compactor
	- store
- Exporters
	- node-exporter
	- postgresql-exporter
	- elasticsearch-exporter
	- nginx-exporter
	- kibana-prometheus-exporter
#### requirements
- Deploy Prometheus as the monitoring and alerting toolkit to collect metrics and monitor the health and performance of various system components.
	- deploy prometheus, alertmanager, and exporters
		- Check the status of each component: http://localhost:9090/targets?search=
	- create dashboard
- Configure data exporters and integrations to capture metrics from different services, databases, and infrastructure components.
	- exporters + scrape setting for django, grafana, thanos 
	```yml:prometheus.yml
	scrape_configs:
	  - job_name: 'django'
	    static_configs:
	      - targets: 
	        - 'web:8000'

	  - job_name: 'grafana_metrics'
		static_configs:
		  - targets: 
			- 'grafana:3000'
	
	  - job_name: 'thanos-store'
		scrape_interval: 5s
		static_configs:
		  - targets:
			- "thanos-store:10906"
		   
	  - job_name: 'thanos-query'
		scrape_interval: 5s
		static_configs:
		  - targets:
			- "thanos-query:10904"
	```
- Create custom dashboards and visualizations using Grafana to provide realtime insights into system metrics and performance.
	- bind mount: grafana/dashboards_settings and grafana/dashboards
	- to see, http://localhost:3000/
- Set up alerting rules in Prometheus to proactively detect and respond to critical issues and anomalies.
	- alert to my slack channel
	- Conditions for sending an alert in prometheus/alert.rules.yml
		- CPU usage exceeds 80%
		- Load average exceeds 1
		- Memory usage exceeds 80%
		- Disk usage exceeds 80%
		- inode usage exceeds 80%
		- I/O request CPU usage exceeds 80%
- Ensure proper data retention and storage strategies for historical metrics data.
	- data retension: prometheus flag
		```yml:devops/system-monitor/compose.yml
		prometheus:
			...
			command:
				...
				- '--storage.tsdb.retention.size=400MB'
			    - '--storage.tsdb.min-block-duration=10m'
			    - '--storage.tsdb.max-block-duration=10m'
		```
	- storage strategies: Prometheus writes metrics data to Thanos. Prometheus local storage is not suitable for long-term data storage. Check the status of Thanos endpoints http://localhost:10904/stores
		```yml:prometheus.yml
		remote_write:
			- url: "http://thanos-receiver:19291/api/v1/receive"
		```
- Implement secure authentication and access control mechanisms for Grafana to protect sensitive monitoring data.
	- Role: 
		- grafana admin
		- Editor
		- Viewer
	-  need to password for access ( Forbid anonymous access)
		- grafana server admin: kousuzuk:kousuzuk42!!
			```
			[security]
			# disable creation of admin user on first start of grafana
			disable_initial_admin_creation = false
			# default admin user, created on startup
			admin_user = kousuzuk
			# default admin password, can be changed before first start of grafana, or in profile settings
			admin_password = kousuzuk42!
			```
		- Editor: {intra_id}:{intra_id}4242!!
			```shell:setup/create_user.sh
			curl -XPOST -u kousuzuk:kousuzuk42! -H "Content-Type: application/json" -d '{
			  "name":"{intra_id}",
			  "email":"{intra_id}@graf.com",
			  "login":"{intra_id}",
			  "password":{intra_id}4242!!",
			  "OrgId": 2
			}' http://grafana:3000/api/admin/users
			curl -X PATCH -u kousuzuk:kousuzuk42! -H "Accept: application/json" -H "Content-Type: application/json" -d '
			{
			  "role":"Editor"
			}' http://grafana:3000/api/orgs/2/users/{user_index}
```
		- Viewer: viewer:Viewer4242!!
		``` .ini
		[auth.anonymous]
		# enable anonymous access
		enabled = false
		```
	- password policy
		```
		password_policy = true
		```
	- Authentication with github account
		```
		[auth.github]
		enabled = true
		allow_sign_up = false
		client_id = {GITHUB_CLIENT_ID}
		client_secret = {GITHUB_CLIENT_SECRET}
		scopes = user:email,read:org
		auth_url = https://github.com/login/oauth/authorize
		token_url = https://github.com/login/oauth/access_token
		api_url = https://api.github.com/user
		```
