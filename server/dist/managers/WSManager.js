"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const RoomManager_1 = require("./RoomManager");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const templateUtils_1 = require("../utils/templateUtils");
const common_1 = require("../types/common");
const constants_1 = require("../config/constants");
const envConfig_1 = __importDefault(require("../config/envConfig"));
const roomValidator_1 = require("../validators/roomValidator");
class WSManager {
    constructor(server) {
        this.wss = new ws_1.WebSocketServer({ server });
        this.rooms = new Map();
        this.clients = new Map();
        this.userConnections = new Map();
        this.publicClients = new Set();
        this.wss.on("connection", (ws, req) => {
            var _a;
            console.log("🔌 New AuthWebSocket Connection Attempt", req.url);
            if ((_a = req.url) === null || _a === void 0 ? void 0 : _a.startsWith("/auth")) {
                this.handlePrivateConnection(ws, req);
            }
            else if (req.url === "/check") {
                this.handlePublicConnection(ws);
            }
            else {
                console.log("❌ Invalid AuthWebSocket Type, Closing Connection");
                ws.close();
            }
        });
    }
    handlePrivateConnection(ws, req) {
        this.authenticateUser(req, ws);
        ws.on("message", (message) => this.handleMessage(ws, message));
        ws.on("close", () => this.handleDisconnect(ws));
        ws.on("error", (err) => console.error("⚠️ AuthWebSocket Error:", err));
    }
    handlePublicConnection(ws) {
        console.log("📡 Public WS Connection Established");
        this.publicClients.add(ws);
        setInterval(() => this.sendAvailableRooms(), 500);
        ws.on("close", () => this.publicClients.delete(ws));
    }
    sendAvailableRooms() {
        const rooms = RoomManager_1.roomManager.getAllRooms();
        const availableRooms = rooms
            .filter((room) => !room.privateRoom &&
            !room.gameState &&
            room.users.length < room.maxUsers)
            .map(({ name, users, maxUsers }) => ({
            name,
            users: users.length,
            maxUsers,
        }));
        const roomData = JSON.stringify({ type: "rooms", payload: availableRooms });
        this.publicClients.forEach((ws) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(roomData);
            }
        });
    }
    authenticateUser(req, ws) {
        var _a;
        try {
            const urlParams = new URLSearchParams((_a = req.url) === null || _a === void 0 ? void 0 : _a.split("?")[1]);
            const params = {
                token: urlParams.get("token"),
                roomName: urlParams.get("roomName"),
            };
            const validationResult = roomValidator_1.wsAuthSchema.safeParse(params);
            if (!validationResult.success) {
                console.warn("⛔ WS Authentication Validation Failed:", validationResult.error.format());
                ws.close(4001, "Invalid authentication parameters");
                return {};
            }
            const { token, roomName } = validationResult.data;
            const SECRET_KEY = envConfig_1.default.JWT_SECRET;
            const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
            if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
                console.warn("⛔ Invalid Token");
                ws.close(4002, "Invalid token");
                return {};
            }
            const room = RoomManager_1.roomManager.getRoom(roomName);
            if (!room || !room.hasUser(decoded.id)) {
                console.warn(`⛔ User ${decoded.id} is not in room '${roomName}'`);
                ws.close(4003, "User not in room");
                return {};
            }
            // 🚨 Reject new connection if the user is already connected
            if (this.userConnections.has(decoded.id)) {
                console.warn(`🚨 User ${decoded.id} already has an active connection. Rejecting new one.`);
                ws.close(4008, "Duplicate connection not allowed");
                return {};
            }
            const isAdmin = room.admin.id === decoded.id;
            if (decoded.isAdmin && !isAdmin) {
                console.warn(`🚨 Unauthorized Admin Attempt: User ${decoded.id} is NOT the admin of room '${roomName}'`);
                ws.close(4005, "Unauthorized: Admin mismatch");
                return {};
            }
            if (room.gameState) {
                console.warn(`🚨 Join Attempt Denied: User ${decoded.id} tried to join an ongoing game in room '${roomName}'`);
                ws.close(4006, "Unauthorized: Game already in progress");
                return {};
            }
            ws.user = decoded;
            ws.roomName = roomName;
            this.addUserToRoom(ws, roomName, decoded.id);
            console.log(`✅ Authenticated user ${decoded.id} for room '${roomName}'`);
            return { roomName, userId: decoded.id };
        }
        catch (error) {
            console.error("⛔ Error verifying token:", error);
            ws.close(4004, "Authentication error");
            return {};
        }
    }
    handleMessage(ws, message) {
        try {
            const data = JSON.parse(message);
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
        }
        catch (error) {
            console.error("❌ Error parsing message:", error);
        }
    }
    handleChatMessage(ws, data) {
        var _a;
        const roomName = ws.roomName;
        const userId = (_a = ws.user) === null || _a === void 0 ? void 0 : _a.id;
        const { message, timestamp } = data;
        if (!userId || !roomName || !message || !timestamp) {
            console.warn("⚠️ Chat message missing required fields.");
            return;
        }
        const room = RoomManager_1.roomManager.getRoom(roomName);
        if (!room) {
            console.warn(`❌ Room '${roomName}' not found for chat message.`);
            return;
        }
        const chatMessage = {
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
            type: common_1.MessageType.Chat,
            payload: { chatMessage },
        });
    }
    abortGame(ws) {
        const roomName = ws.roomName;
        if (!roomName)
            return;
        const room = RoomManager_1.roomManager.getRoom(roomName);
        if (!room)
            return;
        room.gameState = null;
        this.broadcastToRoom(roomName, { type: common_1.MessageType.AbortGame });
    }
    handleProgressUpdate(ws, data) {
        const { userId, percentage, timeTaken } = data;
        const roomName = ws.roomName;
        if (!roomName) {
            console.warn(`🚨 Room not found for AuthWebSocket connection`);
            return;
        }
        const room = RoomManager_1.roomManager.getRoom(roomName);
        if (!room || !room.gameState) {
            console.warn(`🚨 Room not found for AuthWebSocket connection`);
            return;
        }
        if (Date.now() >= room.gameState.endTime) {
            ws.send(JSON.stringify({
                type: "error",
                message: "Game time has ended. Progress update not allowed.",
            }));
            return;
        }
        room.gameState.progress[userId] = { percentage, timeTaken };
        this.broadcastToRoom(roomName, {
            type: common_1.MessageType.TypingUpdate,
            payload: { percentage, userId, timeTaken },
        });
    }
    handleUserLeave(ws) {
        this.handleDisconnect(ws);
    }
    handleStartGame(ws) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const user = ws.user;
                const roomName = ws.roomName;
                if (!roomName || !user) {
                    throw new Error("Some details are missing!!!");
                }
                const room = RoomManager_1.roomManager.getRoom(roomName);
                if (!room) {
                    throw new Error("Room not found!");
                }
                if (((_a = room.admin) === null || _a === void 0 ? void 0 : _a.id) !== user.id || !user.isAdmin) {
                    throw new Error("Only the admin can start the game.");
                }
                const randomTemplate = yield (0, templateUtils_1.getRandomTypingTemplate)(room.difficulty);
                const threshold_time = envConfig_1.default.COOLING_PERIOD_WS;
                const newGameState = {
                    textContent: randomTemplate.text,
                    startTime: Date.now() + threshold_time,
                    status: common_1.GameStatus.COOLING_PERIOD,
                    progress: {},
                    endTime: Date.now() + threshold_time + constants_1.GAME_TIMERS[room.difficulty],
                };
                RoomManager_1.roomManager.initiateGameState(roomName, newGameState);
                this.broadcastToRoom(roomName, {
                    type: common_1.MessageType.StartGame,
                    payload: {
                        gameState: newGameState,
                    },
                });
            }
            catch (error) {
                console.error("Error in handleStartGame:", error);
                ws.send(JSON.stringify({
                    type: "error",
                    message: error.message || "An unexpected error occurred.",
                }));
            }
        });
    }
    handleDisconnect(ws) {
        const roomName = ws.roomName;
        const user = ws.user;
        console.log("🔴 AuthWebSocket Disconnected");
        this.removeUserFromRoomManager(roomName, user === null || user === void 0 ? void 0 : user.id);
        this.removeClientFromSockets(ws);
    }
    addUserToRoom(ws, roomName, userId) {
        var _a;
        if (!this.rooms.has(roomName)) {
            this.rooms.set(roomName, new Set());
        }
        (_a = this.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.add(ws);
        this.clients.set(ws, roomName);
        this.userConnections.set(userId, ws);
        console.log(`👤 User ${userId} joined room: ${roomName}`);
        this.broadcastToRoom(roomName, {
            type: common_1.MessageType.UserJoined,
            payload: {
                user: { id: userId, name: userId },
                message: `${userId} joined the room.`,
            },
        }, ws);
    }
    verifyAndRemoveUser(userId, ws) {
        const roomName = ws.roomName;
        this.removeUserFromRoomManager(roomName, userId);
        this.removeUserFromWebSocket(roomName, userId, ws);
    }
    broadcastToRoom(roomName, data, senderWs) {
        var _a;
        if (!this.rooms.has(roomName))
            return;
        const message = JSON.stringify(data);
        (_a = this.rooms.get(roomName)) === null || _a === void 0 ? void 0 : _a.forEach((client) => {
            if ((!senderWs || client !== senderWs) &&
                client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
    removeUserFromWebSocket(roomName, userId, requestUserSocket) {
        if (!roomName || !this.rooms.has(roomName))
            return;
        const sockets = this.rooms.get(roomName);
        if (!sockets)
            return;
        let targetSocket = null;
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
        this.broadcastToRoom(roomName, {
            type: common_1.MessageType.RemoveUser,
            payload: {
                userId,
                message: `User ${userId} was removed from the room.`,
            },
        }, requestUserSocket);
    }
    removeClientFromSockets(ws) {
        var _a;
        const roomName = ws.roomName;
        const userId = (_a = ws.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!roomName || !userId)
            return;
        console.log(`🗑 Removing user ${userId} from room '${roomName}'`);
        this.userConnections.delete(userId);
        this.clients.delete(ws);
        if (this.rooms.has(roomName)) {
            const room = this.rooms.get(roomName);
            room === null || room === void 0 ? void 0 : room.delete(ws);
            if ((room === null || room === void 0 ? void 0 : room.size) === 0) {
                console.log(`🚨 Room '${roomName}' is empty. Deleting room.`);
                this.rooms.delete(roomName);
            }
        }
        this.broadcastToRoom(roomName, {
            type: common_1.MessageType.LeaveRoom,
            payload: {
                userId,
                message: `${userId} left the room.`,
            },
        }, ws);
    }
    removeUserFromRoomManager(roomName, userId) {
        if (!roomName || !userId) {
            console.warn(`Some missing params`);
            return;
        }
        const room = RoomManager_1.roomManager.getRoom(roomName);
        if (!room) {
            console.warn(`⚠️ Room '${roomName}' not found in RoomManager.`);
            return;
        }
        room.removeUser(userId);
        console.log(`✅ User ${userId} removed from RoomManager room '${roomName}'.`);
        if (room.users.length === 0) {
            RoomManager_1.roomManager.deleteRoom(roomName);
            console.log(`🚨 Room '${roomName}' is now empty. Deleting from RoomManager.`);
        }
    }
    updateRoomUserLimit(roomName, maxUsers) {
        const room = RoomManager_1.roomManager.getRoom(roomName);
        if (!room) {
            console.warn(`⚠️ Room '${roomName}' not found.`);
            return;
        }
        maxUsers = maxUsers !== null && maxUsers !== void 0 ? maxUsers : room.maxUsers; // Use provided maxUsers or fetch from room
        const currentUsers = room.users;
        if (currentUsers.length <= maxUsers) {
            console.log(`✅ No need to remove users, room '${roomName}' is within the limit.`);
            return;
        }
        console.log(`🚨 Room '${roomName}' has too many users! Limiting to ${maxUsers}.`);
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
exports.default = WSManager;
