FROM docker.elastic.co/elasticsearch/elasticsearch:8.17.2

USER root
RUN apt update && apt install -y \
    curl \
    openssl \
	jq
RUN curl -L https://github.com/mikefarah/yq/releases/download/v4.40.5/yq_linux_amd64 -o /usr/bin/yq && \
    chmod +x /usr/bin/yq

COPY --chmod=755 ./entrypoint.sh /usr/share/elasticsearch/entrypoint.sh
COPY --chmod=755 ./healthcheck.sh healthcheck.sh

# 実行権限を明示的に付与
RUN chmod +x /usr/share/elasticsearch/entrypoint.sh /usr/share/elasticsearch/healthcheck.sh

ENTRYPOINT ["/usr/share/elasticsearch/entrypoint.sh"]
