# Stage 1: Build React frontend
FROM node:22-slim AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.13.1-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt update -y && \
    apt install -y python3-dev gcc musl-dev && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock ./

RUN pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction --no-ansi

COPY ./backend/ ./backend/

# Copy built frontend from stage 1
COPY --from=frontend-builder /frontend/dist ./backend/static

COPY start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 8000
CMD ["./start.sh"]
