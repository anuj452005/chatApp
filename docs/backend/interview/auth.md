# Authentication System: Redis & RabbitMQ Interview Q&A

---

## Redis-Related Interview Questions

### 1. Q: Why did you choose Redis for OTP storage and rate limiting?
**A:**  
Redis is an in-memory data store, which makes it extremely fast for read/write operations. OTPs and rate limits are short-lived, temporary data that benefit from Redis's speed and built-in expiry mechanism. Redis allows us to set keys with an expiration time, ensuring OTPs and rate limits are automatically cleaned up, reducing manual maintenance and potential security risks.

---

### 2. Q: How do you implement rate limiting using Redis?
**A:**  
We use a unique key for each user (e.g., `otp:ratelimit:<email>`) and set it in Redis with a short expiry (e.g., 60 seconds) when an OTP is requested. If the key exists, the user is rate-limited and cannot request another OTP until the key expires. This prevents abuse and spamming of the OTP endpoint.

**Example:**
```ts
const rateLimitKey = `otp:ratelimit:${email}`;
const rateLimit = await redisClient.get(rateLimitKey);
if (rateLimit) {
  // User is rate-limited
} else {
  await redisClient.set(rateLimitKey, "true", { EX: 60 });
}
```

---

### 3. Q: How does Redis help in ensuring OTP security?
**A:**  
Redis allows us to store OTPs with a strict expiry (e.g., 5 minutes). This means OTPs are only valid for a short window, reducing the risk of unauthorized use. After successful verification, the OTP is deleted from Redis, making it single-use and further enhancing security.

---

### 4. Q: What would happen if Redis goes down? How would you handle it?
**A:**  
If Redis is unavailable, OTP generation and verification would fail, as the system relies on Redis for storing and validating OTPs and enforcing rate limits. To handle this, we can:
- Implement fallback mechanisms (e.g., temporary in-memory store, though this is not ideal for distributed systems).
- Use Redis clusters or managed Redis services for high availability.
- Add error handling to gracefully inform users of temporary unavailability.

---

## RabbitMQ-Related Interview Questions

### 5. Q: Why did you use RabbitMQ for sending OTP emails instead of sending them directly?
**A:**  
RabbitMQ decouples the user service from the mail service, allowing the user service to quickly enqueue email requests and respond to the user without waiting for the email to be sent. This improves responsiveness and scalability, as the mail service can process emails at its own pace and be scaled independently.

---

### 6. Q: How does the message flow work between the user service and the mail service using RabbitMQ?
**A:**  
When an OTP is generated, the user service publishes a message to a RabbitMQ queue (e.g., `send-otp`). The mail service subscribes to this queue, consumes messages, and sends the actual emails. This asynchronous communication ensures that email delivery does not block user requests.

**Example:**
```ts
// User service
await publishToQueue("send-otp", message);

// Mail service
channel.consume("send-otp", async (msg) => {
  // Send email
});
```

---

### 7. Q: What are the advantages of using a message queue like RabbitMQ in a microservice architecture?
**A:**  
- **Decoupling:** Services can operate independently.
- **Scalability:** Consumers can be scaled horizontally.
- **Reliability:** Messages can be persisted until processed.
- **Asynchronous Processing:** Time-consuming tasks don't block user requests.

---

### 8. Q: How do you ensure that OTP emails are not lost if the mail service is temporarily down?
**A:**  
RabbitMQ persists messages in the queue until they are acknowledged by the consumer (mail service). If the mail service is down, messages remain in the queue and are delivered once the service is back up, ensuring no OTP emails are lost.

---

## Combined/Design Questions

### 9. Q: How would you scale this system to handle millions of users?
**A:**  
- **Redis:** Use Redis clusters for high availability and partitioning.
- **RabbitMQ:** Use multiple consumers for the mail service to process emails in parallel.
- **Stateless Services:** Both user and mail services are stateless and can be scaled horizontally.
- **Monitoring:** Implement monitoring and alerting for Redis and RabbitMQ health.

---

### 10. Q: What security considerations are important when using Redis and RabbitMQ in this context?
**A:**  
- **Redis:** Use strong authentication, network isolation, and TLS encryption.
- **RabbitMQ:** Use secure credentials, encrypted connections, and proper queue permissions.
- **General:** Never log sensitive data (like OTPs), and ensure all environment secrets are protected.

---

## Bonus: Practical Coding Question

### 11. Q: Write a function to store an OTP in Redis with a 5-minute expiry and explain each step.

**A:**
```ts
async function storeOtp(email, otp) {
  // 1. Create a unique key for the user's OTP
  const otpKey = `otp:${email}`;
  // 2. Store the OTP in Redis with a 5-minute expiry (300 seconds)
  await redisClient.set(otpKey, otp, { EX: 300 });
  // 3. (Optional) Log or handle errors as needed
}
```
**Explanation:**  
- The key is unique per user.
- The OTP is stored with an expiry, so it's automatically deleted after 5 minutes.
