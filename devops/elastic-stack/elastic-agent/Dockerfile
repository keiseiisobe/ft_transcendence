FROM elastic/elastic-agent:8.17.2


COPY --chmod=755 ./elastic-agent.yml /usr/share/elastic-agent/elastic-agent.yml
COPY --chmod=755 ./entrypoint.sh /usr/share/elastic-agent/entrypoint.sh

ENTRYPOINT ["sh", "-c", "whoami && /usr/share/elastic-agent/entrypoint.sh"]

