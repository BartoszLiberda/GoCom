
# GoCom

This project aims to provide a self-hosted communications platform that is designed to give its users absolute control over their data and infrastructure. Departing from the centralized cloud models this solution aims to provide a decentralized, instance-based model where each deployment is a completely isolated environment.

Crucially GoCom provides an API-first, headless architecture. While it ships with an official, feature-rich web client, the backend exposes a standardized, fully documented API, empowering the users and developers to build their own custom frontends, terminal clients or mobile apps against their self-hosted infrastructure.

## Running Locally

Ensure Docker, Go, and Node.js is installed on your machine. You will need to open three separate terminal windows to run the database, backend, and frontend concurrently.

### 1. Start the Database
From the root of the project directory, start the PostgreSQL database container:
```bash
docker compose up
```
*(Note: You can add the `-d` flag, `docker compose up -d`, to run this in the background so it doesn't tie up your terminal).*

### 2. Start the Go Backend
In a new terminal, navigate to the backend directory and start the Go server:
```bash
cd backend
go run cmd/api/main.go
```

### 3. Start the React Frontend
In a third terminal, navigate to the frontend directory, install the necessary dependencies, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```
