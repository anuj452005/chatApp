# Backend Microservices

This directory contains the backend microservices for the chat application. Each service is independent and handles a specific domain of the system.

## Structure

- `chat/`  — Handles chat messaging, real-time communication, and chat history.
- `mail/`  — Handles email notifications and related messaging.
- `user/`  — Handles user authentication, registration, and user management.

## Key Features

- **Microservices Architecture:** Each service is independently deployable and scalable, following best practices for modular backend design.
- **TypeScript & Express.js:** All services are written in TypeScript for type safety and use Express.js for building RESTful APIs.
- **Real-Time Communication:** Utilizes Socket.io for real-time chat and live updates between users.
- **Asynchronous Messaging:** Employs RabbitMQ for reliable, event-driven communication between services, supporting decoupled workflows.
- **Caching & Performance:** Integrates Redis for caching, session management, and pub/sub mechanisms to optimize performance and reduce latency.
- **Secure Authentication:** Implements robust authentication, registration, and email verification flows with best security practices.
- **Environment-Based Configuration:** Each service uses its own environment variables for secure and flexible deployments.
- **Scalable & Fault-Tolerant:** Designed for high availability, with message durability and fault tolerance using RabbitMQ and Redis.
- **Extensible Integrations:** Supports third-party services (e.g., Cloudinary for media, email providers for notifications).
- **Comprehensive Documentation:** System architecture and service interactions are well documented for easy onboarding and collaboration.

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
- Redis is used for caching, session storage, and pub/sub for real-time event propagation.

## Technology Highlights

- **Redis:** Used for fast in-memory caching, session management, and real-time pub/sub to enhance chat performance and scalability.
- **RabbitMQ:** Powers asynchronous, event-driven communication between microservices, ensuring reliable message delivery and decoupling of services.
- **Socket.io:** Enables real-time, bidirectional communication for chat features, supporting instant messaging and live updates.

---

For more details, see the `src/` folder in each service or the main project documentation. 