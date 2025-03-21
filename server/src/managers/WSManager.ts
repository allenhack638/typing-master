import { WebSocketServer, WebSocket } from "ws";
import { roomManager } from "./RoomManager";
import { IncomingMessage, Server } from "http";
import jwt from "jsonwebtoken";
import { AuthWebSocket, User } from "../types/user";
import { getRandomTypingTemplate } from "../utils/templateUtils";
import {
  ChatMessage,
  GameState,
  GameStatus,
  MessageType,
  ProgressUpdate,
  RoomMessage,
} from "../types/common";
import { GAME_TIMERS } from "../config/constants";
import Config from "../config/envConfig";
import { wsAuthSchema } from "../validators/roomValidator";

class WSManager {
  private wss: WebSocketServer;
  private rooms: Map<string, Set<AuthWebSocket>>; // roomId -> Set of AuthWebSocket connections
  private clients: Map<AuthWebSocket, string>; // AuthWebSocket -> Room Name
  private userConnections: Map<string, AuthWebSocket>; // User ID -> AuthWebSocket

  private publicClients: Set<AuthWebSocket>;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.rooms = new Map();
    this.clients = new Map();
    this.userConnections = new Map();

    this.publicClients = new Set();

    this.wss.on("connection", (ws: AuthWebSocket, req: IncomingMessage) => {
      console.log("🔌 New AuthWebSocket Connection Attempt", req.url);

      if (req.url?.startsWith("/auth")) {
        this.handlePrivateConnection(ws, req);
      } else if (req.url === "/check") {
        this.handlePublicConnection(ws);
      } else {
        console.log("❌ Invalid AuthWebSocket Type, Closing Connection");
        ws.close();
      }
    });
  }

  private handlePrivateConnection(ws: AuthWebSocket, req: IncomingMessage) {
    this.authenticateUser(req, ws);

    ws.on("message", (message) => this.handleMessage(ws, message));
    ws.on("close", () => this.handleDisconnect(ws));
    ws.on("error", (err) => console.error("⚠️ AuthWebSocket Error:", err));
  }

  private handlePublicConnection(ws: AuthWebSocket) {
    console.log("📡 Public WS Connection Established");
    this.publicClients.add(ws);

    setInterval(() => this.sendAvailableRooms(), 500);
    ws.on("close", () => this.publicClients.delete(ws));
  }

  private sendAvailableRooms() {
    const rooms = roomManager.getAllRooms();
    const availableRooms = rooms
      .filter(
        (room) =>
          !room.privateRoom &&
          !room.gameState &&
          room.users.length < room.maxUsers
      )
      .map(({ name, users, maxUsers }) => ({
        name,
        users: users.length,
        maxUsers,
      }));

    const roomData = JSON.stringify({
      type: MessageType.Rooms,
      payload: { rooms: availableRooms },
    });
    this.publicClients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(roomData);
      }
    });
  }

  private authenticateUser(
    req: IncomingMessage,
    ws: AuthWebSocket
  ): { roomName?: string; userId?: string } {
    try {
      const urlParams = new URLSearchParams(req.url?.split("?")[1]);
      const params = {
        token: urlParams.get("token"),
        roomName: urlParams.get("roomName"),
      };

      const validationResult = wsAuthSchema.safeParse(params);

      if (!validationResult.success) {
        console.warn(
          "⛔ WS Authentication Validation Failed:",
          validationResult.error.format()
        );
        ws.close(4001, "Invalid authentication parameters");
        return {};
      }

      const { token, roomName } = validationResult.data;

      const SECRET_KEY = Config.JWT_SECRET;

      const decoded = jwt.verify(token, SECRET_KEY) as User;

      if (!decoded?.id) {
        console.warn("⛔ Invalid Token");
        ws.close(4002, "Invalid token");
        return {};
      }

      const room = roomManager.getRoom(roomName);
      if (!room || !room.hasUser(decoded.id)) {
        console.warn(`⛔ User ${decoded.id} is not in room '${roomName}'`);
        ws.close(4003, "User not in room");
        return {};
      }

      // 🚨 Reject new connection if the user is already connected
      this.handleCheckActiveUserConnection(decoded.id, ws);

      if (this.userConnections.has(decoded.id)) {
        console.warn(
          `🚨 User ${decoded.id} already has an active connection. Rejecting new one.`
        );
        ws.close(4008, "Duplicate connection not allowed");
        return {};
      }

      const isAdmin = room.admin.id === decoded.id;
      if (decoded.isAdmin && !isAdmin) {
        console.warn(
          `🚨 Unauthorized Admin Attempt: User ${decoded.id} is NOT the admin of room '${roomName}'`
        );
        ws.close(4005, "Unauthorized: Admin mismatch");
        return {};
      }

      if (room.gameState) {
        console.warn(
          `🚨 Join Attempt Denied: User ${decoded.id} tried to join an ongoing game in room '${roomName}'`
        );
        ws.close(4006, "Unauthorized: Game already in progress");
        return {};
      }

      ws.user = decoded;
      ws.roomName = roomName;

      this.addUserToRoom(ws, roomName, decoded.id);

      console.log(`✅ Authenticated user ${decoded.id} for room '${roomName}'`);
      return { roomName, userId: decoded.id };
    } catch (error) {
      console.error("⛔ Error verifying token:", error);
      ws.close(4004, "Authentication error");
      return {};
    }
  }

  private handleMessage(ws: AuthWebSocket, message: unknown) {
    try {
      const data = JSON.parse(message as string);
      console.log("📩 Received Message:", data);

      const type = data.type;
      const payload = data.payload;

      switch (type) {
        case "remove-user":
          this.verifyAndRemoveUser(payload.userId, ws);
          break;

        case "leave-room":
          this.handleUserLeave(ws);
          break;

        case "start-game":
          this.handleStartGame(ws);
          break;

        case "typing-update":
          this.handleProgressUpdate(ws, payload);
          break;

        case "abort-game":
          this.abortGame(ws);
          break;

        case "chat":
          this.handleChatMessage(ws, payload);
          break;

        default:
          console.warn("🚨 Unknown Message Type:", data);
      }
    } catch (error) {
      console.error("❌ Error parsing message:", error);
    }
  }

  public handleCheckActiveUserConnection(id: string, ws?: AuthWebSocket) {
    if (this.userConnections.has(id)) {
      console.warn(
        `🚨 User ${id} already has an active connection. Rejecting new one.`
      );
      if (ws) ws.close(4008, "Duplicate connection not allowed");
      return { error: "Duplicate connection not allowed" };
    }
  }

  private handleChatMessage(
    ws: AuthWebSocket,
    data: Omit<ChatMessage, "userId">
  ) {
    const roomName = ws.roomName;
    const userId = ws.user?.id;

    const { message, timestamp } = data;

    if (!userId || !roomName || !message || !timestamp) {
      console.warn("⚠️ Chat message missing required fields.");
      return;
    }

    const room = roomManager.getRoom(roomName);

    if (!room) {
      console.warn(`❌ Room '${roomName}' not found for chat message.`);
      return;
    }

    const chatMessage: ChatMessage = {
      userId,
      message,
      timestamp: Date.now(),
    };

    if (!room.enableChat || !room.gameState || !room.gameState.chatMessages) {
      console.warn(`❌ Chat not enabled here`);
      return;
    }
    room.gameState.chatMessages.push(chatMessage);

    this.broadcastToRoom(roomName, {
      type: MessageType.Chat,
      payload: { chatMessage },
    });
  }

  private abortGame(ws: AuthWebSocket) {
    const roomName = ws.roomName;
    if (!roomName) return;

    const room = roomManager.getRoom(roomName);
    if (!room) return;

    room.gameState = null;
    this.broadcastToRoom(roomName, { type: MessageType.AbortGame });
  }

  private handleProgressUpdate(ws: AuthWebSocket, data: ProgressUpdate) {
    const { userId, percentage, timeTaken } = data;
    const roomName = ws.roomName;

    if (!roomName) {
      console.warn(`🚨 Room not found for AuthWebSocket connection`);
      return;
    }

    const room = roomManager.getRoom(roomName);

    if (!room || !room.gameState) {
      console.warn(`🚨 Room not found for AuthWebSocket connection`);
      return;
    }

    if (Date.now() >= room.gameState.endTime) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Game time has ended. Progress update not allowed.",
        })
      );
      return;
    }

    room.gameState.progress[userId] = { percentage, timeTaken };

    this.broadcastToRoom(roomName, {
      type: MessageType.TypingUpdate,
      payload: { percentage, userId, timeTaken },
    });
  }

  private handleUserLeave(ws: AuthWebSocket) {
    this.handleDisconnect(ws);
  }

  private async handleStartGame(ws: AuthWebSocket) {
    try {
      const user = ws.user;
      const roomName = ws.roomName;

      if (!roomName || !user) {
        throw new Error("Some details are missing!!!");
      }

      const room = roomManager.getRoom(roomName);

      if (!room) {
        throw new Error("Room not found!");
      }

      if (room.admin?.id !== user.id || !user.isAdmin) {
        throw new Error("Only the admin can start the game.");
      }

      const randomTemplate = await getRandomTypingTemplate(room.difficulty);

      const threshold_time = Config.COOLING_PERIOD_WS;

      const newGameState: GameState = {
        textContent: randomTemplate.text,
        startTime: Date.now() + threshold_time,
        status: GameStatus.COOLING_PERIOD,
        progress: {},
        endTime: Date.now() + threshold_time + GAME_TIMERS[room.difficulty],
      };

      roomManager.initiateGameState(roomName, newGameState);
      this.broadcastToRoom(roomName, {
        type: MessageType.StartGame,
        payload: {
          gameState: newGameState,
        },
      });
    } catch (error) {
      console.error("Error in handleStartGame:", error);
      ws.send(
        JSON.stringify({
          type: "error",
          message: (error as Error).message || "An unexpected error occurred.",
        })
      );
    }
  }

  private handleDisconnect(ws: AuthWebSocket) {
    const roomName = ws.roomName;
    const user = ws.user;

    console.log("🔴 AuthWebSocket Disconnected");
    this.removeUserFromRoomManager(roomName, user?.id);
    this.removeClientFromSockets(ws);
  }

  private addUserToRoom(ws: AuthWebSocket, roomName: string, userId: string) {
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }

    this.rooms.get(roomName)?.add(ws);
    this.clients.set(ws, roomName);
    this.userConnections.set(userId, ws);

    console.log(`👤 User ${userId} joined room: ${roomName}`);

    this.broadcastToRoom(
      roomName,
      {
        type: MessageType.UserJoined,
        payload: {
          user: { id: userId, name: userId },
          message: `${userId} joined the room.`,
        },
      },
      ws
    );
  }

  private verifyAndRemoveUser(userId: string, ws: AuthWebSocket) {
    const roomName = ws.roomName;
    this.removeUserFromRoomManager(roomName, userId);
    this.removeUserFromWebSocket(roomName, userId, ws);
  }

  public broadcastToRoom(
    roomName: string,
    data: RoomMessage,
    senderWs?: AuthWebSocket
  ) {
    if (!this.rooms.has(roomName)) return;
    const message = JSON.stringify(data);

    this.rooms.get(roomName)?.forEach((client) => {
      if (
        (!senderWs || client !== senderWs) &&
        client.readyState === WebSocket.OPEN
      ) {
        client.send(message);
      }
    });
  }

  private removeUserFromWebSocket(
    roomName: string | undefined,
    userId: string,
    requestUserSocket?: AuthWebSocket
  ) {
    if (!roomName || !this.rooms.has(roomName)) return;

    const sockets = this.rooms.get(roomName);
    if (!sockets) return;

    let targetSocket: AuthWebSocket | null = null;

    for (const ws of sockets) {
      const associatedUserId = this.clients.get(ws);

      if (associatedUserId === userId) {
        targetSocket = ws;
        break;
      }
    }

    if (targetSocket) {
      this.clients.delete(targetSocket);
      sockets.delete(targetSocket);
      targetSocket.close();
      console.log(`🔴 AuthWebSocket closed for user ${userId}`);
    }

    if (sockets.size === 0) {
      this.rooms.delete(roomName);
      console.log(`🚨 Room '${roomName}' is now empty and has been deleted.`);
    }

    this.broadcastToRoom(
      roomName,
      {
        type: MessageType.RemoveUser,
        payload: {
          userId,
          message: `User ${userId} was removed from the room.`,
        },
      },
      requestUserSocket
    );
  }

  private removeClientFromSockets(ws: AuthWebSocket) {
    const roomName = ws.roomName;
    const userId = ws.user?.id;

    if (!roomName || !userId) return;

    console.log(`🗑 Removing user ${userId} from room '${roomName}'`);

    this.userConnections.delete(userId);
    this.clients.delete(ws);

    if (this.rooms.has(roomName)) {
      const room = this.rooms.get(roomName);
      room?.delete(ws);

      if (room?.size === 0) {
        console.log(`🚨 Room '${roomName}' is empty. Deleting room.`);
        this.rooms.delete(roomName);
      }
    }

    this.broadcastToRoom(
      roomName,
      {
        type: MessageType.LeaveRoom,
        payload: {
          userId,
          message: `${userId} left the room.`,
        },
      },
      ws
    );
  }

  private removeUserFromRoomManager(
    roomName: string | undefined,
    userId: string | undefined
  ) {
    if (!roomName || !userId) {
      console.warn(`Some missing params`);
      return;
    }

    const room = roomManager.getRoom(roomName);
    if (!room) {
      console.warn(`⚠️ Room '${roomName}' not found in RoomManager.`);
      return;
    }

    room.removeUser(userId);
    console.log(
      `✅ User ${userId} removed from RoomManager room '${roomName}'.`
    );

    if (room.users.length === 0) {
      roomManager.deleteRoom(roomName);
      console.log(
        `🚨 Room '${roomName}' is now empty. Deleting from RoomManager.`
      );
    }
  }

  public updateRoomUserLimit(roomName: string, maxUsers?: number) {
    const room = roomManager.getRoom(roomName);
    if (!room) {
      console.warn(`⚠️ Room '${roomName}' not found.`);
      return;
    }

    maxUsers = maxUsers ?? room.maxUsers; // Use provided maxUsers or fetch from room

    const currentUsers = room.users;
    if (currentUsers.length <= maxUsers) {
      console.log(
        `✅ No need to remove users, room '${roomName}' is within the limit.`
      );
      return;
    }

    console.log(
      `🚨 Room '${roomName}' has too many users! Limiting to ${maxUsers}.`
    );

    const adminId = room.admin.id; // Ensure admin stays
    const usersToRemove = currentUsers
      .filter((user) => user.id !== adminId) // Exclude admin
      .slice(maxUsers - 1); // Select extra users to remove

    usersToRemove.forEach((user) => {
      console.log(`🔴 Removing user ${user.id} from room '${roomName}'`);
      this.removeUserFromWebSocket(roomName, user.id);
      this.removeUserFromRoomManager(roomName, user.id);
    });

    console.log(`✅ Updated room '${roomName}' to fit within maxUsers limit.`);
  }
}

export default WSManager;
