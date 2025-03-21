"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envConfig_1 = __importDefault(require("../config/envConfig"));
const SECRET_KEY = envConfig_1.default.JWT_SECRET;
const authenticateToken = (req, res, next) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
        res
            .status(401)
            .json({ error: "Unauthorized: Token is missing or invalid" });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(403).json({ error: "Forbidden: Invalid token" });
    }
};
exports.authenticateToken = authenticateToken;
