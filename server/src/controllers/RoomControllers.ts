import { Request, Response } from "express";
import { roomManager } from "../managers/RoomManager";
import { generateToken } from "../utils/jwtUtils";
import { wsManager } from "..";
import {
  CreateRoomInput,
  RoomNameParams,
  TokenQuery,
  UpdateRoomInput,
  UserIdQuery,
} from "../validators/roomValidator";
import { MessageType, RoomState } from "../types/common";

export const CreateRoom = (
  req: Request<{}, {}, CreateRoomInput>,
  res: Response
) => {
  try {
    const {
      name,
      userName: adminId,
      maxUsers,
      enableChat,
      privateRoom,
      difficulty,
    } = req.body;

    const newRoom = roomManager.createRoom(
      name,
      maxUsers,
      enableChat,
      privateRoom,
      adminId,
      difficulty
    );

    const token = generateToken({
      name: adminId,
      id: adminId,
      isAdmin: true,
    });

    res.status(200).json({
      token,
      room: newRoom,
      message: "Success in room and user creation",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create a room" });
  }
};

export const JoinRoom = (
  req: Request<RoomNameParams, {}, {}, UserIdQuery>,
  res: Response
) => {
  try {
    const { roomName } = req.params;
    const { userId } = req.query;

    const room = roomManager.getRoom(roomName);
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    if (room.hasUser(userId as string)) {
      res.status(400).json({ error: "User is already in the room" });
      return;
    }

    if (room.maxUsers === room.users.length) {
      res
        .status(400)
        .json({ error: "Maximum user count reached for the group" });
      return;
    }

    const token = generateToken({
      name: userId,
      id: userId,
      isAdmin: false,
    });

    roomManager.addUserToRoom(room.name, userId as string, userId as string);

    res.status(200).json({
      room,
      user: token,
      message: "Room fetched successfully!!!",
    });
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({ message: "Failed to fetch room details" });
  }
};

export const GetRoom = (
  req: Request<RoomNameParams, {}, {}, TokenQuery>,
  res: Response
) => {
  try {
    const { roomName } = req.params;
    const { token } = req.query;
    const user = req.user;

    if (!roomName || !user) {
      res.status(400).json({ error: "Room name or user details missing" });
      return;
    }

    const checkUserConnection = wsManager.handleCheckActiveUserConnection(
      user.id
    );

    if (checkUserConnection?.error) {
      res.status(400).json({ error: checkUserConnection?.error });
      return;
    }

    const validRoom = roomManager.getRoom(roomName);

    if (validRoom?.gameState) {
      res.status(400).json({ error: "Unauthorized: Game already in progress" });
      return;
    }

    if (validRoom) {
      if (!validRoom.hasUser(user.id)) {
        roomManager.addUserToRoom(roomName, user.id, user.id);
      }

      res.status(200).json({
        room: validRoom,
        user: token,
        message: "Room fetched successfully!!!",
      });
      return;
    } else {
      res.status(404).json({ error: "Room not found" });
      return;
    }
  } catch (error) {
    console.error("Error fetching room details:", error);
    res.status(500).json({ message: "Failed to fetch room details" });
  }
};

export const UpdateRoom = (
  req: Request<RoomNameParams, {}, UpdateRoomInput>,
  res: Response
) => {
  try {
    const { roomName } = req.params;
    const user = req.user;
    const updatedFields: Partial<RoomState> = req.body;

    const room = roomManager.getRoom(roomName);

    if (!room || !user) {
      res.status(400).json({ error: "Room name or updatedFields missing" });
      return;
    }

    if (room.admin.id !== user.id || !user.isAdmin) {
      res.status(400).json({ error: "Unauthrised Access: Invalid access" });
      return;
    }

    if (room.gameState) {
      res
        .status(400)
        .json({ error: "Invalid Action: Game already in progress." });
      return;
    }

    Object.keys(updatedFields).forEach((key) => {
      if (key in room) {
        const typedKey = key as keyof RoomState;

        (room as any)[key] = (updatedFields as any)[key];

        if (key === "maxUsers") {
          wsManager.updateRoomUserLimit(roomName);
        }
      }
    });

    wsManager.broadcastToRoom(roomName, {
      type: MessageType.RoomUpdate,
      payload: {
        updatedFields,
      },
    });

    res.status(200).json({ message: "Room updated successfully" });
  } catch (error) {
    console.error("Failed to update room details", error);
    res.status(500).json({ message: "Failed to update room details" });
  }
};

export const AvailableRooms = (req: Request, res: Response) => {
  try {
    const rooms = roomManager.getAllRooms();

    const availableRooms = rooms
      .filter((room) => !room.privateRoom && room.users.length < room.maxUsers)
      .map(({ name, users, maxUsers }) => ({
        name,
        users: users.length,
        maxUsers,
      }));

    res.status(200).json({ rooms: availableRooms });
  } catch (error) {}
};
