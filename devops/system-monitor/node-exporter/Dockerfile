FROM debian:bullseye
RUN apt update && \
	apt install -y vim wget procps iputils-ping net-tools curl

COPY --chmod=755 ./tools/entrypoint.sh /entrypoint.sh

CMD ["sh", "entrypoint.sh"]
