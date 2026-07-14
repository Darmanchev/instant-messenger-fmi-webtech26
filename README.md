# 💬 Web Messenger (FMI WebTech 2026)

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

Полноценное веб-приложение для мгновенного обмена сообщениями (Instant Messenger). Разработано в рамках курса "Web Technologies" (Веб-технологии) в FMI. 

## 💡 О проекте

Проект представляет собой клиент-серверное приложение, реализующее функционал современных мессенджеров. Основной упор сделан на асинхронное взаимодействие и работу в реальном времени с использованием **WebSockets**.

### ✨ Ключевые возможности
- Регистрация и авторизация пользователей (с проверкой надежности паролей).
- Создание каналов/комнат для общения.
- Обмен сообщениями в реальном времени (Real-time Chat).
- Отзывчивый и современный интерфейс пользователя (SPA на React).

## 🚀 Архитектура и стек технологий

Проект разделен на две основные части:

### Базовая архитектура (Backend)
Написан на **Python**.
- Использование фреймворка для построения REST API (вероятно, FastAPI) + WebSockets.
- Управление зависимостями через `Poetry`.
- Взаимодействие с базой данных (CRUD операции для пользователей, каналов, сообщений).

### Пользовательский интерфейс (Frontend)
Написан на **JavaScript / React**.
- Сборка с использованием современного бандлера **Vite**.
- Компонентная структура (ChannelList, MessageList, CreateChannelModal).
- Настроен линтинг (`eslint`).

## ⚙️ Установка и запуск

Проект легко разворачивается с помощью Docker.

1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/Darmanchev/instant-messenger-fmi-webtech26.git
   cd instant-messenger-fmi-webtech26
   ```
2. Используйте `Makefile` или bash-скрипты для быстрого старта:
   ```bash
   ./start.sh
   # или запустите Docker Compose напрямую
   docker-compose -f docker_compose/app.yaml up -d
   ```
3. После запуска фронтенд будет доступен в браузере (по умолчанию на `http://localhost:5173` или `3000`), а API Backend на соответствующем порту.

---
*Проект демонстрирует навыки фуллстек-разработки, работы с веб-сокетами и контейнеризацией.* 🚀
