"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshToken = exports.decodeToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const envConfig_1 = __importDefault(require("../config/envConfig"));
const SECRET_KEY = envConfig_1.default.JWT_SECRET;
const SECRET_EXPIRY = envConfig_1.default.JWT_SECRET_EXPIRY;
const generateToken = (payload, expiresIn = SECRET_EXPIRY) => {
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, { expiresIn });
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, SECRET_KEY);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    return jsonwebtoken_1.default.decode(token);
};
exports.decodeToken = decodeToken;
const refreshToken = (token, newExpiresIn = SECRET_EXPIRY) => {
    const decoded = (0, exports.verifyToken)(token);
    if (!decoded || typeof decoded === "string")
        return null;
    const { iat, exp } = decoded, payload = __rest(decoded, ["iat", "exp"]);
    return (0, exports.generateToken)(payload, newExpiresIn);
};
exports.refreshToken = refreshToken;
