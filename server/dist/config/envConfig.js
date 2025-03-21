"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
class Config {
    static get PORT() {
        return parseInt(process.env.PORT || "3000", 10);
    }
    static get MONGO_URI() {
        if (!process.env.MONGO_URI) {
            throw new Error("Missing MONGO_URI environment variable!");
        }
        return process.env.MONGO_URI;
    }
    static get JWT_SECRET_EXPIRY() {
        const value = process.env.JWT_SECRET_EXPIRY || "3600";
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new Error("Invalid JWT_SECRET_EXPIRY value! It must be a number.");
        }
        return parsedValue;
    }
    static get JWT_SECRET() {
        if (!process.env.JWT_SECRET) {
            throw new Error("Missing JWT_SECRET environment variable!");
        }
        return process.env.JWT_SECRET;
    }
    static get COOLING_PERIOD_WS() {
        const value = process.env.COOLING_PERIOD_WS || "3000";
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new Error("Invalid COOLING_PERIOD_WS value! It must be a number.");
        }
        return parsedValue;
    }
    static get COOLING_PERIOD_HTTP() {
        const value = process.env.COOLING_PERIOD_HTTP || "3000";
        const parsedValue = parseInt(value, 10);
        if (isNaN(parsedValue)) {
            throw new Error("Invalid COOLING_PERIOD_HTTP value! It must be a number.");
        }
        return parsedValue;
    }
}
exports.default = Config;
