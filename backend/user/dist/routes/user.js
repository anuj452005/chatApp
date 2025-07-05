"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_js_1 = require("../controllers/user.js");
const isAuth_js_1 = require("../middleware/isAuth.js");
const router = express_1.default.Router();
router.post("/login", user_js_1.loginUser);
router.post("/verify", user_js_1.verifyUser);
router.get("/me", isAuth_js_1.isAuth, user_js_1.myProfile);
router.get("/user/all", isAuth_js_1.isAuth, user_js_1.getAllUsers);
router.get("/user/:id", user_js_1.getAUser);
router.post("/update/user", isAuth_js_1.isAuth, user_js_1.updateName);
exports.default = router;
