"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    const url = process.env.MONGO_URI;
    if (!url) {
        throw new Error("MONGO_URI is not defined in enviroment variables");
    }
    try {
        await mongoose_1.default.connect(url, {
            dbName: "Chatappmicroserviceapp",
        });
        console.log("Connected to mongodb");
    }
    catch (error) {
        console.error("Failed to connect to Mongodb", error);
        process.exit(1);
    }
};
exports.default = connectDb;
