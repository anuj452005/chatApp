"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_1 = require("../controllers/user");
const isAuth_1 = require("../middleware/isAuth");
const router = express_1.default.Router();
router.post("/login", user_1.loginUser);
router.post("/verify", user_1.verifyUser);
router.get('/me', isAuth_1.isAuth, user_1.myProfile);
router.get('/user/all', isAuth_1.isAuth, user_1.getAllUsers);
router.get('/user/:id', user_1.getAUser);
router.post('/update/user', isAuth_1.isAuth, user_1.updateName);
exports.default = router;
