"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoomRouter_1 = __importDefault(require("./routes/RoomRouter"));
const TemplateRouter_1 = __importDefault(require("./routes/TemplateRouter"));
const AppRouter = (0, express_1.Router)();
AppRouter.use("/room", RoomRouter_1.default);
AppRouter.use("/templates", TemplateRouter_1.default);
exports.default = AppRouter;
