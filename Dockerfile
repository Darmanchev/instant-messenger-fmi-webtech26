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

EXPOSE 8000
