# 💬 Web Messenger (FMI WebTech 2026)

![Python](https://img.shields.io/badge/Python-3.8%2B-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

A full-fledged web application for instant messaging. Developed as part of the "Web Technologies" course at FMI.

## 💡 About the Project

This project is a client-server application that implements the core functionality of modern messengers. The main focus is on asynchronous interaction and real-time communication using **WebSockets**.

### ✨ Key Features
- User registration and authentication (with strong password policy enforcement).
- Creation of channels/rooms for communication.
- Real-time messaging (Real-time Chat).
- A responsive and modern user interface (React SPA).

## 🚀 Architecture and Tech Stack

The project is split into two main components:

### Backend Architecture
Written in **Python**.
- Uses a framework for building a REST API (likely FastAPI) combined with WebSockets.
- Dependency management is handled by `Poetry`.
- Database interactions (CRUD operations for users, channels, and messages).

### User Interface (Frontend)
Written in **JavaScript / React**.
- Built with the modern **Vite** bundler.
- Component-based structure (`ChannelList`, `MessageList`, `CreateChannelModal`).
- Configured linting (`eslint`).

## ⚙️ Installation and Setup

The project can be easily deployed using Docker.

1. Clone the repository:
   ```bash
   git clone https://github.com/Darmanchev/instant-messenger-fmi-webtech26.git
   cd instant-messenger-fmi-webtech26
   ```
2. Use the `Makefile` or bash scripts for a quick start:
   ```bash
   ./start.sh
   # or run Docker Compose directly
   docker-compose -f docker_compose/app.yaml up -d
   ```
3. Once running, the frontend will be available in your browser (usually at `http://localhost:5173` or `3000`), and the API Backend will be on its respective port.

---
*This project highlights skills in full-stack development, WebSocket integration, and containerization.* 🚀
