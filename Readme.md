# 🔐 JWT-Based Authentication & Authorization API

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Framework-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)
![JWT](https://img.shields.io/badge/Auth-JWT-blue)
![Deployed](https://img.shields.io/badge/Deployed-Render-purple)

A production-ready REST API implementing **JWT Authentication**, **Refresh Token Rotation**, **Role-Based Authorization (RBAC-ready)**, and **Scalable Pagination**, built using Node.js, Express, and MongoDB.

---

## 🚀 Live Deployment

🌍 **Base URL:**  
https://jwt-based-authentication-authorization.onrender.com

🩺 **Health Check Endpoint:**  
GET https://jwt-based-authentication-authorization.onrender.com/api/v1/healthcheck

---

## 📌 Overview

This project demonstrates a real-world backend authentication architecture used in scalable production systems.

It includes:

- Access Token + Refresh Token mechanism
- Secure password hashing (bcrypt)
- Refresh token rotation strategy
- Protected routes middleware
- Role-ready authorization structure
- Aggregate-based pagination
- Centralized error handling
- Versioned API (`/api/v1`)
- Deployment monitoring via health check endpoint

The application follows clean architecture and separation of concerns.

---

## 🏗 Architecture Design

The project follows a layered backend architecture:

**Routes → Controllers → Services → Models**

Key architectural highlights:

- Versioned API structure (`/api/v1`)
- Middleware-based authentication & authorization
- Centralized error handling
- Custom API response formatter
- Modular & scalable folder structure
- Environment-based configuration

This ensures maintainability, scalability, and production readiness.

---

## 🛠 Tech Stack

- **Node.js**
- **Express.js**
- **MongoDB (Atlas)**
- **Mongoose**
- **jsonwebtoken (JWT)**
- **bcrypt**
- **dotenv**
- **mongoose-aggregate-paginate-v2**
- **Nodemon**

---

## 📁 Project Structure

```
JWT-based-Authentication-Authorization-API/
│
├── src/
│   ├── controllers/      # Business logic
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middlewares/      # Auth & file upload middleware
│   ├── utils/            # ApiError, ApiResponse, asyncHandler
│   ├── db/               # Database connection
│   ├── app.js            # Express app setup
│   └── index.js          # Server entry point
│
├── .env
├── package.json
└── README.md
```

---

## 🔐 Authentication Flow

### 1️⃣ Register
- Password hashed using bcrypt
- User saved in database

### 2️⃣ Login
- Credentials validated
- Access token + Refresh token generated

### 3️⃣ Protected Routes
Requires:

```
Authorization: Bearer <access_token>
```

### 4️⃣ Refresh Token Rotation
- Old refresh token invalidated
- New access token generated
- Secure token lifecycle maintained

---

## 📡 Core API Endpoints

All routes are prefixed with:

```
/api/v1
```

---

### 🔐 Authentication

| Method | Endpoint |
|--------|----------|
| POST | /api/v1/users/register |
| POST | /api/v1/users/login |
| POST | /api/v1/users/logout |
| POST | /api/v1/users/refresh-token |

---

### 👤 User

| Method | Endpoint |
|--------|----------|
| GET | /api/v1/users/:userId |
| PATCH | /api/v1/users/update |

---

### 🎥 Video (Paginated)

| Method | Endpoint |
|--------|----------|
| POST | /api/v1/videos |
| GET | /api/v1/videos/:videoId |
| GET | /api/v1/videos?page=1&limit=10 |

Pagination is implemented using:

```
mongoose-aggregate-paginate-v2
```

---

### 📝 Tweet

| Method | Endpoint |
|--------|----------|
| POST | /api/v1/tweets |
| GET | /api/v1/tweets/:userId?page=1&limit=10 |
| PATCH | /api/v1/tweets/:tweetId |
| DELETE | /api/v1/tweets/:tweetId |

---

### 📁 Playlist

| Method | Endpoint |
|--------|----------|
| POST | /api/v1/playlist |
| GET | /api/v1/playlist/:playlistId |
| PATCH | /api/v1/playlist/:playlistId |
| DELETE | /api/v1/playlist/:playlistId |
| PATCH | /api/v1/playlist/add/:playlistId/:videoId |
| PATCH | /api/v1/playlist/remove/:playlistId/:videoId |

---

### ❤️ Like

| Method | Endpoint |
|--------|----------|
| PATCH | /api/v1/like/toggle/video/:videoId |
| PATCH | /api/v1/like/toggle/comment/:commentId |
| PATCH | /api/v1/like/toggle/tweet/:tweetId |

---

## 📊 Pagination Strategy

Implemented using:

```
mongoose-aggregate-paginate-v2
```

Benefits:

- Scalable for large datasets
- Supports aggregation pipelines
- Efficient for production use
- Better than simple skip-limit approach

Example query:

```
?page=1&limit=10
```

---

## 🛡 Security Practices

- Password hashing with bcrypt
- Access & refresh token separation
- Token expiration management
- Refresh token rotation
- Middleware-based route protection
- MongoDB ObjectId validation
- Centralized error handling
- Structured API responses

---

## 📑 Standard API Response Format

```json
{
  "status": 200,
  "data": {},
  "message": "Operation successful"
}
```

---

## ⚙ Environment Variables

Create a `.env` file in root directory:

```
PORT=8000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_access_token_secret
REFRESH_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
```

---

## 🚀 Local Setup

```bash
git clone https://github.com/itzvaibhavsh/JWT-based-Authentication-Authorization-API.git
cd JWT-based-Authentication-Authorization-API
npm install
npm run dev
```

Server runs at:

```
http://localhost:8000
```

---

## 🧪 Testing

Recommended Tools:

- Postman
- Thunder Client
- Curl

Suggested Flow:

1. Register user
2. Login to obtain tokens
3. Test protected routes
4. Test refresh token flow
5. Validate logout behavior

---

## 📈 Future Improvements

- Full Role-Based Access Control (RBAC)
- Swagger API Documentation
- Rate Limiting
- Docker Support
- Redis-based token blacklist
- Unit & Integration Tests
- CI/CD Pipeline

---

## 👨‍💻 Author

**Vaibhav Sharma**  
Backend Developer | MERN Stack | Authentication Systems  

---

⭐ If you found this project useful, consider giving it a star!
