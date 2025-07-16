# 🎮 Games Lobby API (NestJS + PostgreSQL + JWT)

This project is a **backend system for managing game lobbies and rooms**,  
built with **NestJS**, **PostgreSQL**, and **JWT Authentication**.  
It demonstrates **clean architecture, scalable design**, and **real-world API development** – perfect for showcasing in interviews.

---

## 📚 Table of Contents
- [🚀 Tech Stack](#-tech-stack)
- [✅ Features](#-features)
- [🏗 Architecture](#-architecture)
- [⚙️ Installation & Setup](#️-installation--setup)
- [🔐 Authentication Flow](#-authentication-flow)
- [📡 API Endpoints](#-api-endpoints)
- [🛠 Future Improvements](#-future-improvements)

---

## 🚀 Tech Stack
- **Backend:** [NestJS](https://nestjs.com/)
- **Database:** PostgreSQL + [TypeORM](https://typeorm.io/)
- **Authentication:** JWT (JSON Web Token)
- **Validation:** class-validator + ValidationPipe
- **Language:** TypeScript
- **Security:** Guards, Global Auth Strategy

---

## ✅ Features
✔ JWT-based authentication  
✔ Protected routes using **Global Auth Guard**  
✔ Public routes using `@Public()` decorator  
✔ User registration & login  
✔ Create game rooms & manage lobbies  
✔ Join & leave rooms (players managed **in-memory**)  
✔ Database persistence for rooms (Postgres)  
✔ Modular architecture with NestJS best practices  

---

## 🏗 Architecture
```
src/
│
├── auth/         # Authentication (JWT, guards, strategies)
├── users/        # User module (CRUD, register, login)
├── room/         # Lobby & room logic
├── common/       # Shared decorators, utilities
└── main.ts       # App bootstrap
```

### **Data Flow**
- **Users** are stored in the database.
- **Rooms** are stored in the database (name, game type, max players).
- **Players in rooms** are stored **in-memory** for fast operations.

---

## ⚙️ Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/games-lobby-api.git
cd games-lobby-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file:
```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASS=1234
DATABASE_NAME=games-db
JWT_SECRET=your_secret_key
```

### 4. Run the application
```bash
npm run start:dev
```

---

## 🔐 Authentication Flow
### **Register**
`POST /users/register`
```json
{
  "username": "player1",
  "password": "1234"
}
```

### **Login**
`POST /auth/login`
```json
{
  "username": "player1",
  "password": "1234"
}
```
Response:
```json
{
  "access_token": "<JWT_TOKEN>"
}
```

Use this token in the header for all protected routes:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 📡 API Endpoints

### **Users**
- `POST /users/register` → Register a new user
- `POST /auth/login` → Login and get JWT token

### **Rooms**
- `GET /room` → Get all rooms
- `POST /room` → Create a new room
```json
{
  "name": "Room 1",
  "gameType": "war",
  "maxPlayers": 4
}
```
- `POST /room/:roomId/join` → Join a room
```json
{
  "userId": "<user_id>"
}
```
- `POST /room/:roomId/leave` → Leave a room
```json
{
  "userId": "<user_id>"
}
```
- `GET /room/:roomId/players` → Get all players in a room

---

## 🛠 Future Improvements
- ✅ Add WebSocket support for real-time updates
- ✅ Implement refresh tokens for session management
- ✅ Add role-based access control (Admin, Player)
- ✅ Add game logic (e.g., War, Chess) on top of the lobby system
- ✅ Unit & integration tests with Jest

---

## 📷 Preview
![NestJS Logo](https://nestjs.com/img/logo-small.svg)  
A clean and scalable backend architecture for modern gaming platforms.

---

## ⭐ Contribute
If you like this project, give it a ⭐ on [GitHub](https://github.com/)!  
Feel free to fork and add new features.

---
