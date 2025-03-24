FROM nginx:1.25-bookworm
COPY ./setup.sh ./setup.sh
RUN chmod +x /setup.sh && /setup.sh && rm /setup.sh
COPY ./default.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["/bin/sh", "-c", "mkdir -p /var/log/nginx && touch /var/log/nginx/error.log && nginx -g 'daemon off;'"]
