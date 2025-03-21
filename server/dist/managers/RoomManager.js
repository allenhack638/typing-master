"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomManager = void 0;
class Room {
    constructor(name, maxUsers, enableChat, privateRoom, adminId, difficulty) {
        this.id = name;
        this.name = name;
        this.maxUsers = maxUsers;
        this.users = [{ id: adminId, name: adminId }];
        this.enableChat = enableChat;
        this.privateRoom = privateRoom;
        this.difficulty = difficulty;
        this.admin = { id: adminId, name: adminId };
        this.gameState = null;
    }
    addUser(userId, userName) {
        if (this.users.length >= this.maxUsers) {
            throw new Error("Room is full");
        }
        this.users.push({ id: userId, name: userName });
    }
    removeUser(userId) {
        this.users = this.users.filter((user) => user.id !== userId);
    }
    hasUser(userId) {
        return this.users.some((user) => user.id === userId);
    }
}
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(name, maxUsers, enableChat, privateRoom, adminId, difficulty) {
        const room = new Room(name, maxUsers, enableChat, privateRoom, adminId, difficulty);
        this.rooms.set(room.name, room);
        return room;
    }
    getRoom(name) {
        return this.rooms.get(name);
    }
    deleteRoom(name) {
        this.rooms.delete(name);
    }
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    addUserToRoom(roomName, userId, userName) {
        const room = this.getRoom(roomName);
        if (!room) {
            throw new Error("Room not found");
        }
        try {
            room.addUser(userId, userName);
            return { id: userId, name: userName };
        }
        catch (error) {
            console.error(error);
            return null;
        }
    }
    hasUser(roomName, userId) {
        const room = this.getRoom(roomName);
        return room ? room.hasUser(userId) : false;
    }
    removeUser(roomName, userId) {
        const room = this.getRoom(roomName);
        if (room) {
            room.removeUser(userId);
            return true;
        }
        else
            return false;
    }
    initiateGameState(roomName, gameState) {
        const room = this.getRoom(roomName);
        if (!room)
            return false;
        room.gameState = gameState;
        return true;
    }
}
exports.roomManager = new RoomManager();
