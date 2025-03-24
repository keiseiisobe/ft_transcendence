FROM debian:bullseye

RUN apt-get update && apt-get install -y vim wget curl procps 
COPY --chmod=755 ./elastic-agent.yml /usr/share/elastic-agent/elastic-agent.yml
COPY --chmod=755 ./entrypoint.sh /usr/share/elastic-agent/entrypoint.sh

ENTRYPOINT ["sh", "-c", "whoami && /usr/share/elastic-agent/entrypoint.sh"]

