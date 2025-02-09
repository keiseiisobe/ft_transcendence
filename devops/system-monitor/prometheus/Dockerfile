FROM debian:bullseye

RUN apt update && \
	apt install -y vim wget procps iputils-ping net-tools curl lsof
COPY ./tools/entrypoint.sh /entrypoint.sh
COPY ./tools/prometheus.yml /prometheus.yml

CMD ["sh", "entrypoint.sh"]
