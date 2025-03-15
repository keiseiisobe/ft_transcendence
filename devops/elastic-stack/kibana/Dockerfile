FROM docker.elastic.co/kibana/kibana:8.17.2

USER root
RUN apt-get update && apt-get install -y gosu
COPY --chmod=755 ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["sh", "-c", "whoami && /entrypoint.sh"]
