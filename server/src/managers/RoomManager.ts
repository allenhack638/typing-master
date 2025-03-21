import { DifficultyLevel, GameState, RoomState } from "../types/common";
import { User } from "../types/user";

class Room implements RoomState {
  id: string;
  name: string;
  maxUsers: number;
  users: User[];
  enableChat: boolean;
  privateRoom: boolean;
  difficulty: DifficultyLevel;
  admin: User;
  gameState: GameState | null;

  constructor(
    name: string,
    maxUsers: number,
    enableChat: boolean,
    privateRoom: boolean,
    adminId: string,
    difficulty: DifficultyLevel
  ) {
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

  addUser(userId: string, userName: string) {
    if (this.users.length >= this.maxUsers) {
      throw new Error("Room is full");
    }
    this.users.push({ id: userId, name: userName });
  }

  removeUser(userId: string) {
    this.users = this.users.filter((user) => user.id !== userId);
  }
  hasUser(userId: string): boolean {
    return this.users.some((user) => user.id === userId);
  }
}

class RoomManager {
  private rooms: Map<string, Room>;

  constructor() {
    this.rooms = new Map();
  }

  createRoom(
    name: string,
    maxUsers: number,
    enableChat: boolean,
    privateRoom: boolean,
    adminId: string,
    difficulty: DifficultyLevel
  ): Room {
    const room = new Room(
      name,
      maxUsers,
      enableChat,
      privateRoom,
      adminId,
      difficulty
    );
    this.rooms.set(room.name, room);
    return room;
  }

  getRoom(name: string): Room | undefined {
    return this.rooms.get(name);
  }

  deleteRoom(name: string) {
    this.rooms.delete(name);
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  addUserToRoom(roomName: string, userId: string, userName: string) {
    const room = this.getRoom(roomName);
    if (!room) {
      throw new Error("Room not found");
    }
    try {
      room.addUser(userId, userName);
      return { id: userId, name: userName };
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  hasUser(roomName: string, userId: string): boolean {
    const room = this.getRoom(roomName);
    return room ? room.hasUser(userId) : false;
  }

  removeUser(roomName: string, userId: string): boolean {
    const room = this.getRoom(roomName);
    if (room) {
      room.removeUser(userId);
      return true;
    } else return false;
  }

  initiateGameState(roomName: string, gameState: GameState | null): boolean {
    const room = this.getRoom(roomName);
    if (!room) return false;
    room.gameState = gameState;
    return true;
  }
}

export const roomManager = new RoomManager();
