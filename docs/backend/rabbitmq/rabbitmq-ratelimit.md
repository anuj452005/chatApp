# Rate Limiting with RabbitMQ (Beginner Tutorial)

## What is Rate Limiting?

**Rate limiting** is a technique used to control how many times someone can perform a certain action in a given period. For example, you might want to limit how many OTP emails a user can request per minute to prevent spam or abuse.

## Why Use Rate Limiting?
- **Prevents abuse** (e.g., spamming OTP requests)
- **Protects your system** from being overloaded
- **Improves user experience** by avoiding accidental repeated actions

## How Can You Rate Limit with RabbitMQ?

RabbitMQ itself does not have built-in rate limiting for consumers, but you can implement rate limiting in your application logic. Here are two common ways:

### 1. Application-Level Rate Limiting (Recommended for Beginners)

You check how many requests a user has made before publishing a message to RabbitMQ. If they exceed the limit, you don't send the message.

**Example using Redis (fast in-memory database):**

```ts
// Pseudocode for user service before publishing to RabbitMQ
const userKey = `otp-requests:${userId}`;
const requests = await redisClient.incr(userKey);
if (requests === 1) {
  await redisClient.expire(userKey, 60); // Set 1 minute window
}
if (requests > 5) {
  return res.status(429).json({ message: "Too many OTP requests. Please try again later." });
}
// If under limit, publish to RabbitMQ
publishToQueue("send-otp", { to, subject, body });
```
- This limits users to 5 OTP requests per minute.
- You can adjust the number and time window as needed.

### 2. Consumer-Side Rate Limiting (Advanced)

You can slow down how fast your consumer (e.g., mail service) processes messages from the queue.

**Example:**
```ts
channel.consume(queueName, async (msg) => {
  // ... process message ...
  await new Promise(resolve => setTimeout(resolve, 200)); // Wait 200ms between messages
  channel.ack(msg);
});
```
- This makes sure you only process a certain number of messages per second.
- Not user-specific, but can help protect your mail service from overload.

### 3. RabbitMQ Plugins (For Advanced Users)

RabbitMQ has plugins like the [rabbitmq_rate_limit](https://github.com/rabbitmq/rabbitmq-server/issues/110) plugin, but these are not always available or easy to set up for beginners. Most projects use application-level logic.

---

## Which Method Should You Use?
- For **user-specific limits** (e.g., per user, per IP), use **application-level rate limiting** with Redis or your database.
- For **overall system protection**, you can add a delay in your consumer.

---

## Summary Table

| Method                | Where Implemented | Good For                |
|-----------------------|-------------------|-------------------------|
| Application-level     | User service      | Per-user/IP limits      |
| Consumer-side delay   | Mail service      | System-wide throttling  |
| RabbitMQ plugin       | RabbitMQ server   | Advanced, less common   |

---

## Example: Limiting OTP Requests Per User

1. User requests OTP → User service checks Redis for count.
2. If under limit, message is published to RabbitMQ.
3. If over limit, user gets a 429 error (Too Many Requests).
4. Mail service processes messages as usual.

---

## How Rate Limiting is Used in This Project

In this project, **application-level rate limiting** is implemented in the user service using Redis. This ensures that a user cannot request more than a set number of OTP emails in a given time window.

### Where is the Logic?

- **File:** `backend/user/src/routes/user.ts` (or a similar controller file handling OTP requests)
- **Redis Client Setup:** `backend/user/src/index.ts`
- **RabbitMQ Publishing:** `backend/user/src/config/rabbitmq.ts`

### How Does It Work?
1. When a user requests an OTP, the route handler in `user.ts` checks Redis to see how many OTP requests that user has made in the last minute.
2. If the user is under the limit, the request is allowed and a message is published to the RabbitMQ queue (`send-otp`) using the logic in `rabbitmq.ts`.
3. If the user exceeds the limit, the route handler returns a 429 error and does **not** publish the message.

**Example Flow:**
```ts
// backend/user/src/routes/user.ts
router.post('/send-otp', async (req, res) => {
  const userId = req.body.userId;
  const userKey = `otp-requests:${userId}`;
  const requests = await redisClient.incr(userKey);
  if (requests === 1) {
    await redisClient.expire(userKey, 60); // 1 minute window
  }
  if (requests > 5) {
    return res.status(429).json({ message: "Too many OTP requests. Please try again later." });
  }
  // If under limit, publish to RabbitMQ
  await publishToQueue("send-otp", { to: req.body.email, subject: "OTP", body: req.body.otp });
  res.json({ message: "OTP sent!" });
});
```

- The Redis client is initialized in `backend/user/src/index.ts`.
- The `publishToQueue` function is defined in `backend/user/src/config/rabbitmq.ts`.

---

**Tip:** Always keep your rate limiting logic close to where you handle user requests, so you can easily adjust limits and provide clear feedback to users.

If you want to see the exact code or need help finding these files, just ask!

---

**Tip:** Always give users a clear error message if they hit a rate limit!

If you want to see a full code example or need help setting up Redis for rate limiting, just ask!
