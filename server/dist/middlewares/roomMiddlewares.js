"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserJoining = void 0;
const RoomManager_1 = require("../managers/RoomManager");
const validateUserJoining = (req, res, next) => {
    const { roomName } = req.params;
    const user = req.user;
    if (!roomName || !user) {
        return res.status(400).json({ error: "Room name or user details missing" });
    }
    const room = RoomManager_1.roomManager.getRoom(roomName);
    if (!room) {
        return res.status(404).json({ error: "Room not found" });
    }
    if (room.hasUser(user.id)) {
        return res.status(400).json({ error: "User is already in the room" });
    }
    req.roomName = roomName;
    next();
};
exports.validateUserJoining = validateUserJoining;
