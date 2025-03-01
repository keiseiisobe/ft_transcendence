.PHONY: compose re all_stop prune rebuild exec os_check get_token


LOCAL_VOLUMES := $(shell docker volume ls -qf dangling=true)

compose:
	docker-compose up

re: prune compose 

all_stop:
	docker stop $(docker ps -q)

prune: 
	rm -rf ./data
	docker compose down
	docker system prune -af --volumes
	@make local_volume_del

rebuild:
	@read -p "ENTER CONTAINER NAME: " container_name; \
	(docker compose down; docker-compose build --no-cache "$$container_name";)
	

exec:
	@read -p "ENTER CONTAINER NAME: " container_name; \
	(docker exec -it "$$container_name" bash;)

exec_sh:
	@read -p "ENTER CONTAINER NAME: " container_name; \
	(docker exec -it "$$container_name" sh;)

os_check:
	@read -p "ENTER IMAGE: " image; \
	(docker run --rm "&&image" cat /etc/os-release;)

get_token:
	docker exec -it elasticsearch bash -c "/usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana"


local_volume_del:
	docker volume rm $(LOCAL_VOLUMES)

ea_rebuild:
	docker compose down
	@make local_volume_del
	docker compose build --no-cache elastic-agent
	docker compose up

