FROM grafana/grafana-enterprise

COPY --chmod=755 ./defaults.ini /usr/share/grafana/conf/defaults.ini
COPY --chmod=755 ./prometheus-datasource.yml /etc/grafana/provisioning/datasources/prometheus-datasource.yml
COPY --chmod=755 ./dashboard-settings /etc/grafana/provisioning/dashboards
COPY --chmod=755 ./dashboards /var/lib/grafana/dashboards
