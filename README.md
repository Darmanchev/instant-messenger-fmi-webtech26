## Instant Messenger

Real-time chat built with FastAPI, PostgreSQL, WebSocket and Bootstrap.

**Stack:** FastAPI · PostgreSQL · WebSocket · JWT · Docker · Bootstrap 5

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

### 4. Open in browser
```
http://localhost:8088/login
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
| `make all` | Start DB + App |
| `make all-down` | Stop everything |
| `make logs` | View app logs |
| `make shell` | Terminal inside app container |
| `make seed` | Fill DB with demo data |
| `make storages` | Start only DB |
| `make app` | Start only App |

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
└── app/
    ├── client/
    │   ├── html/       # login, register, chat pages
    │   ├── scripts/    # JS
    │   └── styles/     # CSS
    └── server/
        ├── main.py
        ├── api/        # endpoints
        ├── core/       # auth, config, websocket
        ├── db/
        ├── models/
        └── schemas/
```
