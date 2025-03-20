FROM debian:bullseye
#FROM docker.elastic.co/beats/elastic-agent:8.17.2

RUN apt-get update && apt-get install -y vim wget curl procps #iputils-ping net-tools lsof netcat
#RUN mkdir -p /usr/share/self-yml
COPY --chmod=755 ./elastic-agent.yml /usr/share/elastic-agent/elastic-agent.yml
COPY --chmod=755 ./entrypoint.sh /usr/share/elastic-agent/entrypoint.sh

ENTRYPOINT ["sh", "-c", "whoami && /usr/share/elastic-agent/entrypoint.sh"]

