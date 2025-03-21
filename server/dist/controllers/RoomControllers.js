"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AvailableRooms = exports.UpdateRoom = exports.GetRoom = exports.JoinRoom = exports.CreateRoom = void 0;
const RoomManager_1 = require("../managers/RoomManager");
const jwtUtils_1 = require("../utils/jwtUtils");
const __1 = require("..");
const common_1 = require("../types/common");
const CreateRoom = (req, res) => {
    try {
        const { name, userName: adminId, maxUsers, enableChat, privateRoom, difficulty, } = req.body;
        const newRoom = RoomManager_1.roomManager.createRoom(name, maxUsers, enableChat, privateRoom, adminId, difficulty);
        const token = (0, jwtUtils_1.generateToken)({
            name: adminId,
            id: adminId,
            isAdmin: true,
        });
        res.status(200).json({
            token,
            room: newRoom,
            message: "Success in room and user creation",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create a room" });
    }
};
exports.CreateRoom = CreateRoom;
const JoinRoom = (req, res) => {
    try {
        const { roomName } = req.params;
        const { userId } = req.query;
        const room = RoomManager_1.roomManager.getRoom(roomName);
        if (!room) {
            res.status(404).json({ error: "Room not found" });
            return;
        }
        if (room.hasUser(userId)) {
            res.status(400).json({ error: "User is already in the room" });
            return;
        }
        if (room.maxUsers === room.users.length) {
            res
                .status(400)
                .json({ error: "Maximum user count reached for the group" });
            return;
        }
        const token = (0, jwtUtils_1.generateToken)({
            name: userId,
            id: userId,
            isAdmin: false,
        });
        RoomManager_1.roomManager.addUserToRoom(room.name, userId, userId);
        res.status(200).json({
            room,
            user: token,
            message: "Room fetched successfully!!!",
        });
    }
    catch (error) {
        console.error("Error fetching room details:", error);
        res.status(500).json({ message: "Failed to fetch room details" });
    }
};
exports.JoinRoom = JoinRoom;
const GetRoom = (req, res) => {
    try {
        const { roomName } = req.params;
        const { token } = req.query;
        const user = req.user;
        if (!roomName || !user) {
            res.status(400).json({ error: "Room name or user details missing" });
            return;
        }
        const validRoom = RoomManager_1.roomManager.getRoom(roomName);
        if (validRoom === null || validRoom === void 0 ? void 0 : validRoom.gameState) {
            res.status(400).json({ error: "Unauthorized: Game already in progress" });
            return;
        }
        if (validRoom) {
            if (!validRoom.hasUser(user.id)) {
                RoomManager_1.roomManager.addUserToRoom(roomName, user.id, user.id);
            }
            res.status(200).json({
                room: validRoom,
                user: token,
                message: "Room fetched successfully!!!",
            });
            return;
        }
        else {
            res.status(404).json({ error: "Room not found" });
            return;
        }
    }
    catch (error) {
        console.error("Error fetching room details:", error);
        res.status(500).json({ message: "Failed to fetch room details" });
    }
};
exports.GetRoom = GetRoom;
const UpdateRoom = (req, res) => {
    try {
        const { roomName } = req.params;
        const user = req.user;
        const updatedFields = req.body;
        const room = RoomManager_1.roomManager.getRoom(roomName);
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
                const typedKey = key;
                room[key] = updatedFields[key];
                if (key === "maxUsers") {
                    __1.wsManager.updateRoomUserLimit(roomName);
                }
            }
        });
        __1.wsManager.broadcastToRoom(roomName, {
            type: common_1.MessageType.RoomUpdate,
            payload: {
                updatedFields,
            },
        });
        res.status(200).json({ message: "Room updated successfully" });
    }
    catch (error) {
        console.error("Failed to update room details", error);
        res.status(500).json({ message: "Failed to update room details" });
    }
};
exports.UpdateRoom = UpdateRoom;
const AvailableRooms = (req, res) => {
    try {
        const rooms = RoomManager_1.roomManager.getAllRooms();
        const availableRooms = rooms
            .filter((room) => !room.privateRoom && room.users.length < room.maxUsers)
            .map(({ name, users, maxUsers }) => ({
            name,
            users: users.length,
            maxUsers,
        }));
        res.status(200).json({ rooms: availableRooms });
    }
    catch (error) { }
};
exports.AvailableRooms = AvailableRooms;
