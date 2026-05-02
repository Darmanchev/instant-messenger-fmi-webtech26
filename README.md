# instant-messenger-fmi-webtech26
Web Messenger project for the FMI Web Technologies course.

Instant messenger built with FastAPI, PostgreSQL, WebSocket and Bootstrap.

## Tech Stack

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, WebSocket
- **Frontend**: HTML, Bootstrap 5, JavaScript
- **Auth**: JWT
- **Infra**: Docker, Docker Compose, Poetry

## Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/Darmanchev/instant-messenger-fmi-webtech26.git
cd instant-messenger-fmi-webtech26
```

### 2. Create `.env` file
```bash
cp .env.example .env
```

Edit `.env` if needed (default values work out of the box):
```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=bestmessenger
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/bestmessenger
SECRET_KEY=secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. Start the app
```bash
make all
```

### 4. Seed the database
```bash
make seed
```

### 5. Open in browser
```
http://localhost:8000/docs   ← API docs
```

Open `http://localhost:8000/login` in your browser.

Demo accounts:
```
alice@test.com  / 123456
bob@test.com    / 123456
admin@test.com  / admin
```

---

## Commands

```bash
make all            # start everything (DB + APP)
make storages       # start only PostgreSQL
make app            # start only APP
make all-down       # stop everything
make app-logs       # view APP logs
make app-shell      # open terminal inside APP container
make seed           # fill DB with initial data
```

---

## Project Structure

```
instant_messeger/
├── pyproject.toml
├── .env.example
├── Makefile
├── Dockerfile
├── docker_compose/
│   ├── app.yaml
│   └── storages.yaml
└── app/
    ├── client/
    │   ├── html/
    │   ├── scripts/
    │   └── styles/
    └── server/
        ├── main.py
        ├── core/
        ├── db/
        ├── models/
        ├── schemas/
        ├── services/
        └── api/
```
