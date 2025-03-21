import { Request, Response, NextFunction } from "express";
import { roomManager } from "../managers/RoomManager";

export const validateUserJoining = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roomName } = req.params;
  const user = req.user;

  if (!roomName || !user) {
    return res.status(400).json({ error: "Room name or user details missing" });
  }

  const room = roomManager.getRoom(roomName);
  if (!room) {
    return res.status(404).json({ error: "Room not found" });
  }

  if (room.hasUser(user.id)) {
    return res.status(400).json({ error: "User is already in the room" });
  }

  req.roomName = roomName;
  next();
};
