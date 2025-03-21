"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsAuthSchema = exports.tokenQuerySchema = exports.userIdQuerySchema = exports.levelParamsSchema = exports.roomNameParamsSchema = exports.updateRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
const common_1 = require("../types/common");
exports.createRoomSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Room name is required"),
    userName: zod_1.z.string().min(1, "Admin ID is required"),
    maxUsers: zod_1.z
        .number()
        .int()
        .min(2, "Minimum 2 users required")
        .max(10, "Maximum 10 users allowed"),
    enableChat: zod_1.z.boolean(),
    privateRoom: zod_1.z.boolean(),
    difficulty: zod_1.z.nativeEnum(common_1.DifficultyLevel),
});
exports.updateRoomSchema = zod_1.z
    .object({
    difficulty: zod_1.z.nativeEnum(common_1.DifficultyLevel).optional(),
    maxUsers: zod_1.z.number().min(2).max(10).optional(),
    enableChat: zod_1.z.boolean().optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (difficulty, maxUsers, or enableChat) must be provided.",
});
exports.roomNameParamsSchema = zod_1.z.object({
    roomName: zod_1.z.string().min(3, "Room name must be at least 3 characters"),
});
exports.levelParamsSchema = zod_1.z.object({
    level: zod_1.z.nativeEnum(common_1.DifficultyLevel),
});
exports.userIdQuerySchema = zod_1.z.object({
    userId: zod_1.z.string().min(3, "User ID is required"),
});
const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
exports.tokenQuerySchema = zod_1.z.object({
    token: zod_1.z.string().regex(jwtRegex, "Invalid JWT format"),
});
exports.wsAuthSchema = zod_1.z.object({
    token: zod_1.z.string().regex(jwtRegex, "Invalid JWT format"),
    roomName: zod_1.z.string().min(3, "Room name must be at least 3 characters"),
});
