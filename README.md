# Instant Messenger

A small real-time messenger I built for the FMI Web Technologies course. I wanted to go beyond a basic CRUD project, so I added live chat rooms, authentication and message history in one full-stack application.

## What works

- registration and login with JWT tokens;
- channel creation and deletion;
- real-time messages over WebSockets;
- message history, search and deletion;
- responsive React interface;
- PostgreSQL persistence and seed data.

## Why I chose this stack

I used **FastAPI** because its async model works well for both REST endpoints and WebSockets. **React** made it easier to separate the chat, channel list and forms into small components. I chose **PostgreSQL + SQLAlchemy** because users, channels and messages have clear relations and should survive server restarts. Docker keeps the local setup reproducible.

The hardest part was keeping REST authentication and WebSocket authentication consistent. A WebSocket connection does not use the normal `Authorization` header flow from my fetch requests, so the client passes the JWT during the handshake and the backend validates it before accepting the connection. Switching channels also required closing the previous socket to avoid duplicate messages.

## Stack

- Python 3.12, FastAPI, SQLAlchemy 2, asyncpg
- React 19, Vite, Bootstrap
- PostgreSQL 17
- JWT, WebSockets
- Poetry, Docker Compose

## Run with Docker

Requirements: Docker with Compose, Node.js 22+ and npm.

```bash
git clone https://github.com/Darmanchev/instant-messenger-fmi-webtech26.git
cd instant-messenger-fmi-webtech26
cp .env.example .env
make all
make seed
```

Open [http://localhost:8088](http://localhost:8088). `make all` builds the React app, starts PostgreSQL and starts the FastAPI container.

Useful commands:

```bash
make logs       # backend logs
make shell      # shell inside the backend container
make all-down   # stop the application and database
```

## Run in development mode

Start PostgreSQL and the backend:

```bash
cp .env.example .env
make storages
poetry install
poetry run uvicorn backend.main:app --reload --port 8088
```

In another terminal:

```bash
cd frontend
npm ci
npm run dev
```

Vite proxies API and WebSocket traffic to port `8088`.

## Project structure

```text
backend/api/       REST and WebSocket endpoints
backend/core/      authentication, passwords and socket manager
backend/models/    SQLAlchemy models
backend/schemas/   request and response schemas
frontend/src/      React pages and components
docker_compose/    app and PostgreSQL services
```

## Current status and next steps

This is a working course-project version. The next things I would add are automated tests, database migrations, channel membership and permissions, message editing, reconnect/error handling for WebSockets and stricter production CORS settings.
