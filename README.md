# Backend Microservices

This directory contains the backend microservices for the chat application. Each service is independent and handles a specific domain of the system.

## Structure

- `chat/`  — Handles chat messaging, real-time communication, and chat history.
- `mail/`  — Handles email notifications and related messaging.
- `user/`  — Handles user authentication, registration, and user management.

## Getting Started

Each service is a standalone Node.js project. To run any service:

1. Navigate to the service directory (e.g., `cd chat`)
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the service:
   ```sh
   npm run dev
   ```

## Environment Variables
Each service requires its own environment variables. See the respective service's documentation or `.env.example` file for details.

## Communication
- Services communicate via HTTP and RabbitMQ (for messaging/events).
- Real-time chat uses WebSockets (Socket.io).

## Development
- Written in TypeScript
- Uses Express.js for HTTP APIs
- Each service can be developed and deployed independently

---

For more details, see the `src/` folder in each service or the main project documentation. 