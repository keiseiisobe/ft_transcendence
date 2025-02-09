FROM docker.elastic.co/elasticsearch/elasticsearch:8.16.3
User root
RUN apt update -y && \
    apt install -y vim wget  net-tools curl
# COPY --chmod=755 ./config/elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml
USER elasticsearch
# Add your elasticsearch plugins setup here
RUN elasticsearch-plugin install analysis-kuromoji

