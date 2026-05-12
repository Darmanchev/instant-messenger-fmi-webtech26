#FROM python:3.13.1-slim-bookworm
#
#ENV PYTHONDONTWRITEBYTECODE 1
#ENV PYTHONUNBUFFERED 1
#
#WORKDIR /fastapi-messenger
#
#RUN apt update -y && \
#    apt install -y python3-dev \
#    gcc \
#    musl-dev && \
#    apt clean && \
#    rm -rf /var/lib/apt/lists/*
#
#ADD pyproject.toml poetry.lock /fastapi_chat/
#
#RUN pip install --upgrade pip
#RUN pip install poetry
#RUN poetry config virtualenvs.create false
#RUN poetry install --no-root --no-interaction --no-ansi
#
#COPY ./app/ /fastapi-messenger/app/
#
#EXPOSE 8000






#-----------------

FROM python:3.13.1-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /fastapi-messenger

# Install system dependencies
RUN apt update -y && \
    apt install -y python3-dev \
    gcc \
    musl-dev && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml poetry.lock ./

RUN pip install --upgrade pip && \
    pip install poetry && \
    poetry config virtualenvs.create false && \
    poetry install --no-root --no-interaction --no-ansi

# Copy the application code
COPY ./app/ ./app/

EXPOSE 8000