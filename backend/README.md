# Vedaz Expert Booking API - Backend

The backend system for the Vedaz Expert Booking application. This service powers the real-time expert discovery and scheduling platform, providing secure APIs for user bookings and expert management.

## 🚀 Innovative Architecture
Departing from traditional HTTP-only polling booking systems, this architecture integrates **Socket.io** for real-time bi-directional event communication. This allows clients to receive instant booking confirmations and updates without repeatedly polling the server, drastically reducing server load and improving client responsiveness.

## ✨ Core Features
- **RESTful API endpoints** for managing Experts and Bookings.
- **Real-Time WebSockets** via Socket.io to push instantaneous booking state changes to clients.
- **Automated Self-Ping**: Built-in cron job using `node-cron` that periodically pings the server to prevent cold starts on ephemeral cloud hosting environments.
- **Global Error Handling**: Centralized error middleware ensures predictable API responses and prevents application crashes.

## 🛡️ Security Measures
- **CORS Configuration**: Restricts unauthorized cross-origin requests to protect API endpoints.
- **Environment Isolation**: Sensitive credentials (like MongoDB URIs) are strictly loaded via `.env` files and never hardcoded.
- **Input Sanitization**: Client requests are parsed and validated safely before any database operations.
- **Protected Stack Traces**: The global error handler shields internal server details and stack traces from being leaked to the client in production.

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-Time**: Socket.io
- **Task Scheduling**: node-cron

## 📦 Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   BACKEND_URL=your_server_url_for_cron
   ```
3. **Database Seeding (Optional):**
   ```bash
   npm run seed
   ```
4. **Run the Server:**
   ```bash
   npm run dev    # Development mode
   npm start      # Production mode
   ```
