import { z } from "zod";
import { DifficultyLevel } from "../types/common";

export const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  userName: z.string().min(1, "Admin ID is required"),
  maxUsers: z
    .number()
    .int()
    .min(2, "Minimum 2 users required")
    .max(10, "Maximum 10 users allowed"),
  enableChat: z.boolean(),
  privateRoom: z.boolean(),
  difficulty: z.nativeEnum(DifficultyLevel),
});

export const updateRoomSchema = z
  .object({
    difficulty: z.nativeEnum(DifficultyLevel).optional(),
    maxUsers: z.number().min(2).max(10).optional(),
    enableChat: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "At least one field (difficulty, maxUsers, or enableChat) must be provided.",
  });

export const roomNameParamsSchema = z.object({
  roomName: z.string().min(3, "Room name must be at least 3 characters"),
});

export const levelParamsSchema = z.object({
  level: z.nativeEnum(DifficultyLevel),
});

export const userIdQuerySchema = z.object({
  userId: z.string().min(3, "User ID is required"),
});

const jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

export const tokenQuerySchema = z.object({
  token: z.string().regex(jwtRegex, "Invalid JWT format"),
});

export const wsAuthSchema = z.object({
  token: z.string().regex(jwtRegex, "Invalid JWT format"),
  roomName: z.string().min(3, "Room name must be at least 3 characters"),
});

export type WsAuthParams = z.infer<typeof wsAuthSchema>;

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type RoomNameParams = z.infer<typeof roomNameParamsSchema>;
export type LevelParams = z.infer<typeof levelParamsSchema>;
export type UserIdQuery = z.infer<typeof userIdQuerySchema>;
export type TokenQuery = z.infer<typeof tokenQuerySchema>;
