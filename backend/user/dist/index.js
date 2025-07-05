"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisClient = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_js_1 = __importDefault(require("./config/db.js"));
const redis_1 = require("redis");
const user_js_1 = __importDefault(require("./routes/user.js"));
const rabbitmq_js_1 = require("./config/rabbitmq.js");
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
(0, db_js_1.default)();
(0, rabbitmq_js_1.connectRabbitMQ)();
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL,
});
exports.redisClient
    .connect()
    .then(() => console.log("connected to redis"))
    .catch(console.error);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use("/api/v1", user_js_1.default);
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
