FROM alpine:latest
RUN apk add --no-cache curl
COPY --from=quay.io/prometheuscommunity/elasticsearch-exporter:latest /bin/elasticsearch_exporter /bin/elasticsearch_exporter
COPY --chmod=755 entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
