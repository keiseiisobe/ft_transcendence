FROM nginx:1.25-bookworm
COPY ./setup.sh ./setup.sh
RUN chmod +x /setup.sh && /setup.sh && rm /setup.sh
COPY ./default.conf /etc/nginx/conf.d/default.conf