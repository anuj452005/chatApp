# Redis in This Project

## What is Redis?

Redis is an in-memory data store, often used for caching, short-lived data, and fast key-value operations. In this project, Redis is used for:
- **OTP (One-Time Password) storage**
- **Rate limiting** (to prevent abuse of OTP requests)

---

## Why Use Redis for OTP and Rate Limiting?
- **Speed:** Redis is extremely fast for read/write operations, ideal for temporary data like OTPs.
- **Expiry:** Redis supports key expiry, so OTPs and rate limits are automatically cleaned up.
- **Atomic Operations:** Useful for rate limiting (e.g., incrementing counters).
- **Simplicity:** No need for manual cleanup or complex logic for expiring data.

---

## Redis Setup in the Project

### 1. Install Redis and the Node.js Client

Make sure you have Redis running (locally or via a cloud provider).

Install the Redis client in your service (see `backend/user/package.json`):
```sh
npm install redis
```

### 2. Environment Variable

Set your Redis connection string in your `.env` file:
```
REDIS_URL=redis://localhost:6379
```

### 3. Initialization (See `backend/user/src/index.ts`)
```ts
import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient
  .connect()
  .then(() => console.log("connected to redis"))
  .catch(console.error);
```
- This creates and connects a Redis client using the URL from your environment variables.

---

## How Redis is Used

### 1. OTP Storage and Expiry
When a user requests an OTP, the backend:
- Generates a 6-digit OTP
- Stores it in Redis with a 5-minute expiry

**Code Example (from `backend/user/src/controllers/user.ts`):**
```ts
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpKey = `otp:${email}`;
await redisClient.set(otpKey, otp, { EX: 300 }); // 5 minutes expiry
```
- The OTP is only valid for 5 minutes. After that, Redis deletes it automatically.

### 2. Rate Limiting OTP Requests
To prevent abuse, the backend limits how often a user can request an OTP:
- When an OTP is requested, a rate limit key is set in Redis with a 1-minute expiry.
- If the key exists, the user is rate-limited.

**Code Example:**
```ts
const rateLimitKey = `otp:ratelimit:${email}`;
const rateLimit = await redisClient.get(rateLimitKey);
if (rateLimit) {
  // User is rate-limited
  res.status(429).json({ message: "Too many requests. Please wait before requesting new OTP" });
  return;
}
await redisClient.set(rateLimitKey, "true", { EX: 60 }); // 1 minute expiry
```
- This ensures a user cannot spam OTP requests.

### 3. OTP Verification and Deletion
When a user submits an OTP for verification:
- The backend retrieves the OTP from Redis and compares it.
- If valid, the OTP is deleted from Redis (single-use).

**Code Example:**
```ts
const storedOtp = await redisClient.get(otpKey);
if (!storedOtp || storedOtp !== enteredOtp) {
  // Invalid or expired OTP
  res.status(400).json({ message: "Invalid or expired OTP" });
  return;
}
await redisClient.del(otpKey); // Delete OTP after successful verification
```

---

## What Happens if Redis is Down?
- OTP generation and verification will fail (since the system relies on Redis for these operations).
- Add error handling to gracefully inform users if Redis is temporarily unavailable.
- For production, use Redis clusters or managed Redis for high availability.

---

## Summary Table
| Use Case         | Redis Key Example         | Expiry | Purpose                        |
|------------------|--------------------------|--------|--------------------------------|
| OTP Storage      | `otp:user@example.com`   | 5 min  | Store OTP for verification     |
| Rate Limiting    | `otp:ratelimit:email`    | 1 min  | Prevent OTP spam/abuse         |

---

## Full Example: OTP Request Flow
```ts
// 1. Check rate limit
const rateLimitKey = `otp:ratelimit:${email}`;
const rateLimit = await redisClient.get(rateLimitKey);
if (rateLimit) {
  res.status(429).json({ message: "Too many requests. Please wait before requesting new OTP" });
  return;
}

// 2. Generate and store OTP
const otp = Math.floor(100000 + Math.random() * 900000).toString();
const otpKey = `otp:${email}`;
await redisClient.set(otpKey, otp, { EX: 300 }); // 5 min expiry
await redisClient.set(rateLimitKey, "true", { EX: 60 }); // 1 min expiry

// 3. Send OTP (via RabbitMQ, not shown here)

// 4. On verification, check and delete OTP
const storedOtp = await redisClient.get(otpKey);
if (!storedOtp || storedOtp !== enteredOtp) {
  res.status(400).json({ message: "Invalid or expired OTP" });
  return;
}
await redisClient.del(otpKey);
```

---

## Why This Approach?
- **Security:** OTPs are single-use and expire quickly.
- **Performance:** Redis is fast and efficient for this use case.
- **Simplicity:** No manual cleanup needed; Redis handles expiry.
- **Scalability:** Works well in distributed/microservice systems.

---

## References
- [Redis Official Docs](https://redis.io/docs/)
- [Node Redis Client](https://github.com/redis/node-redis)
