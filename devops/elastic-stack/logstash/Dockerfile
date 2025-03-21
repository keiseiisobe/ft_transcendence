FROM docker.elastic.co/logstash/logstash:8.17.2

COPY ./elastic-agent_pipeline.conf /usr/share/logstash/pipeline/elastic-agent_pipeline.conf
USER root
RUN chmod 755 /usr/share/logstash/pipeline/elastic-agent_pipeline.conf
USER logstash

ENTRYPOINT ["logstash", "-f", "/usr/share/logstash/pipeline/elastic-agent_pipeline.conf" ]

