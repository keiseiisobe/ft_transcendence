FROM docker.elastic.co/logstash/logstash:8.17.2

USER root
RUN apt-get update && apt-get install -y gosu

COPY --chmod=755 ./logstash.yml /usr/share/logstash/config/logstash.yml
COPY --chmod=755 ./logstash.conf /usr/share/logstash/pipeline/logstash.conf
COPY --chmod=755 ./entrypoint.sh /entrypoint.sh

ENTRYPOINT ["sh", "-c", "whoami && /entrypoint.sh"]

