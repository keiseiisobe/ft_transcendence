FROM debian:bullseye
RUN apt update && apt install -y vim wget procps iputils-ping net-tools curl

COPY ./tools/entrypoint.sh /entrypoint.sh

COPY ./tools/prometheus-datasource.yml /prometheus-datasource.yml

COPY ./tools/dashboards/node-exporter.json /node-exporter.json
COPY ./tools/dashboards/postgres.json /postgres.json
COPY ./tools/dashboard-settings/node-exporter.yml /node-exporter.yml

CMD ["sh", "/entrypoint.sh"]
