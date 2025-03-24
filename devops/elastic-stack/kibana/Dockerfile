FROM docker.elastic.co/kibana/kibana:8.17.2

USER root
RUN apt-get update && apt-get install -y gosu
COPY --chmod=755 ./entrypoint.sh /entrypoint.sh
COPY --chmod=755 ./kibana.yml /usr/share/kibana/config/kibana.yml

ENTRYPOINT ["sh", "-c", "whoami && /entrypoint.sh"]
