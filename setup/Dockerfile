FROM docker.elastic.co/elasticsearch/elasticsearch:8.17.2

USER root
RUN apt update && apt install -y curl openssl jq gosu
RUN curl -L https://github.com/mikefarah/yq/releases/download/v4.40.5/yq_linux_amd64 -o /usr/bin/yq && \
    chmod +x /usr/bin/yq

COPY ./entrypoint.sh /usr/share/scripts/entrypoint.sh
COPY ./healthcheck.sh /usr/share/scripts/healthcheck.sh
COPY ./generate_certificates/elasticstack.sh /usr/share/scripts/elasticstack.sh
COPY ./generate_certificates/elasticstack.yml /usr/share/elasticsearch/elasticstack-certificates.yml
COPY ./es01/generate_index_lifecycle_policy.sh /usr/share/scripts/generate_index_lifecycle_policy.sh
COPY ./es01/generate_snapshot_lifecycle_policy.sh /usr/share/scripts/generate_snapshot_lifecycle_policy.sh
COPY ./kibana/setup-kibana-dashboard.sh /usr/share/scripts/setup-kibana-dashboard.sh
COPY ./kibana/kibana-create-user.sh /usr/share/scripts/kibana-create-user.sh
COPY ./grafana/create_org.sh /usr/share/scripts/create_org.sh
COPY ./grafana/create_user.sh /usr/share/scripts/create_user.sh

COPY ./kibana/kibana-dashboards/nginx_dashboard.ndjson /usr/share/elasticsearch/nginx_dashboard.ndjson


RUN chmod 755 /usr/share/scripts/*.sh

ENTRYPOINT ["sh", "-c", "ls -al /usr/share/scripts/entrypoint.sh && whoami && /usr/share/scripts/entrypoint.sh"]
