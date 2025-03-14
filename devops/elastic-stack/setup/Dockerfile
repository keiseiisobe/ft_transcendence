FROM docker.elastic.co/elasticsearch/elasticsearch:8.17.2

USER root
RUN apt update && apt install -y \
    curl \
    openssl \
	jq
RUN curl -L https://github.com/mikefarah/yq/releases/download/v4.40.5/yq_linux_amd64 -o /usr/bin/yq && \
    chmod +x /usr/bin/yq

COPY ./entrypoint.sh /usr/share/scripts/entrypoint.sh
COPY ./healthcheck.sh /usr/share/scripts/healthcheck.sh
COPY ./generate_certificates/elasticstack.sh /usr/share/scripts/elasticstack.sh
COPY ./setup-kibana-dashboard.sh /usr/share/scripts/setup-kibana-dashboard.sh

COPY ./kibana-dashboards/nginx_dashboard.ndjson /usr/share/elasticsearch/nginx_dashboard.ndjson


#RUN chmod +x /usr/share/scripts/entrypoint.sh /usr/share/scripts/healthcheck.sh /usr/share/scripts/elasticstack.sh /usr/share/scripts/setup-kibana-dashboard.sh

#RUN ls -l /usr/share/scripts/entrypoint.sh
#RUN chown -R elasticsearch:elasticsearch /usr/share/scripts/entrypoint.sh /usr/share/scripts/healthcheck.sh /usr/share/scripts/elasticstack.sh /usr/share/scripts/setup-kibana-dashboard.sh \
RUN chmod +x /usr/share/scripts/entrypoint.sh /usr/share/scripts/healthcheck.sh /usr/share/scripts/elasticstack.sh /usr/share/scripts/setup-kibana-dashboard.sh
ENTRYPOINT ["sh", "-c", "ls -al /usr/share/scripts/entrypoint.sh && whoami && /usr/share/scripts/entrypoint.sh"]
