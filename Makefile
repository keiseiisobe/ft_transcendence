.PHONY: prune compose rebuild exec os_check

prune:
	docker compose down
	docker system prune --all --volumes

compose:
	docker-compose up -d

rebuild:
	docker compose down
	@read -p "ENTER CONTAINER NAME: " container_name; \
	(docker-compose build --no-cache "$$container_name";)

exec:
	@read -p "ENTER CONTAINER NAME: " container_name; \
	(docker exec -it "$$container_name" bash;)

os_check:
	@read -p "ENTER IMAGE: " image; \
	(docker run --rm "&&image" cat /etc/os-release;)
