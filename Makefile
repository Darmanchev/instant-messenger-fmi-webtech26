DC = docker compose
EXEC = docker exec -it
LOGS = docker logs
ENV = --env-file .env
APP_FILE = docker_compose/app.yaml
STORAGES_FILE = docker_compose/storages.yaml
APP_CONTAINER = instantmessenger_app


.PHONY: app
app:
	${DC} -f ${APP_FILE} ${ENV} up --build -d

.PHONY: storages
storages:
	${DC} -f ${STORAGES_FILE} ${ENV} up --build -d

.PHONY: all
all:
	${DC} -f ${STORAGES_FILE} -f ${APP_FILE} ${ENV} up --build -d

.PHONY: app-down
app-down:
	${DC} -f ${APP_FILE} down
	-docker rm -f ${APP_CONTAINER} 2>/dev/null

.PHONY: storages-down
storages-down:
	${DC} -f ${STORAGES_FILE} down

.PHONY: app-shell
shell:
	${EXEC} ${APP_CONTAINER} bash

.PHONY: logs
logs:
	${LOGS} ${APP_CONTAINER} -f

.PHONY: seed
seed:
	${EXEC} -w /app ${APP_CONTAINER} env PYTHONPATH=. python backend/seed.py


.PHONE: allddd
allddd:


.PHONY: all-down
all-down:
	-docker rm -f ${APP_CONTAINER} 2>/dev/null
	${DC} -f ${STORAGES_FILE} -f ${APP_FILE} down
