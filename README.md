## InstantMessenger

Real-time chat built with FastAPI, PostgreSQL, WebSocket and React.

**Stack:** FastAPI · PostgreSQL · WebSocket · JWT · React · Bootstrap 5 · Docker

---

## Quick Start

### 1. Clone
```bash
git clone https://github.com/Darmanchev/instant-messenger-fmi-webtech26.git
cd instant-messenger-fmi-webtech26
```

### 2. Create `.env`
```bash
cp .env.example .env
```

`.env` по умолчанию готов к использованию — ничего менять не нужно.

### 3. Start
```bash
make all
```

`make all` автоматически соберёт React-фронтенд и поднимет контейнеры.

### 4. Open in browser
```
http://localhost:8088
```

### 5. (Optional) Seed demo data
```bash
make seed
```

Demo accounts after seed:
```
alice@test.com  / 123456
bob@test.com    / 123456
admin@test.com  / admin
```

---

## Commands

| Command | Description |
|---|---|
| `make all` | Build frontend + start DB + App |
| `make all-down` | Stop everything |
| `make build-frontend` | Rebuild React app only |
| `make logs` | View app logs |
| `make shell` | Terminal inside app container |
| `make seed` | Fill DB with demo data |
| `make storages` | Start only DB |
| `make app` | Start only App (DB must be running) |
| `make app-down` | Stop only App |

---

## Ports

| Service | Port |
|---|---|
| App | http://localhost:8088 |
| PostgreSQL | localhost:5433 |
| API docs | http://localhost:8088/docs |

---

## Project Structure

```
├── Dockerfile
├── Makefile
├── .env.example
├── docker_compose/
│   ├── app.yaml        # app container
│   └── storages.yaml   # postgres container
├── backend/
│   ├── main.py
│   ├── seed.py
│   ├── api/v1/
│   │   └── endpoints/  # auth, channels, messages, ws
│   ├── core/           # auth, config, websocket
│   ├── db/
│   ├── models/
│   └── schemas/
└── frontend/
    ├── src/
    │   ├── pages/      # Login, Register, Chat
    │   └── components/ # ChannelList, MessageList, MessageInput, CreateChannelModal
    ├── vite.config.js
    └── package.json
```

---

## Development (frontend hot-reload)

```bash
cd frontend && npm run dev
```
