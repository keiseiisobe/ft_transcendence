FROM postgres

COPY --chmod=755 postgresql.conf /etc/postgresql/postgresql.conf
COPY --chmod=755 init-pg-stat-statements.sql /docker-entrypoint-initdb.d/init-pg-stat-statements.sql

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
