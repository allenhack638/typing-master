import { DifficultyLevel, GameStatus } from "./enums";

export enum MessageType {
  RemoveUser = "remove-user",
  UserJoined = "user-joined",
  LeaveRoom = "leave-room",
  StartGame = "start-game",
  TypingUpdate = "typing-update",
  RoomUpdate = "room-update",
  AbortGame = "abort-game",
  Rooms = "rooms",
  Chat = "chat",
}

export interface RoomState {
  id: string | null;
  name: string;
  maxUsers: number;
  users: User[];
  enableChat: boolean;
  privateRoom: boolean;
  difficulty: DifficultyLevel;
  admin: User | null;
  gameState: GameState | null;
}

export type Progress = Record<
  string,
  { percentage: number; timeTaken: number }
>;

export interface ChatMessage {
  userId: string;
  message: string;
  timestamp: number;
}

export interface GameState {
  status: GameStatus;
  startTime: number;
  textContent: string;
  progress: Progress;
  endTime: number;
  chatMessages?: ChatMessage[];
}

export interface Room {
  id: string;
  name: string;
  maxUsers: number;
  enableChat: boolean;
  users: string[];
}

export interface User {
  id: string;
  name: string;
  isAdmin: boolean;
}

// Define payloads for each message type
interface MessageBasePayload {
  message?: string;
}

interface RemoveUserPayload extends MessageBasePayload {
  userId: string;
}

interface UserJoinedPayload extends MessageBasePayload {
  user: { id: string; name: string };
}

interface LeaveUserPayload extends MessageBasePayload {
  userId: string;
}

interface StartGamePayload extends MessageBasePayload {
  gameState: GameState;
}

interface TypingUpdatePayload extends MessageBasePayload {
  percentage: number;
  userId: string;
  timeTaken: number;
}

export type UpdateFeildsType = Partial<
  Pick<RoomState, "maxUsers" | "enableChat" | "difficulty">
>;

interface RoomUpdatePayload extends MessageBasePayload {
  updatedFields: UpdateFeildsType;
}

interface RoomsAvailablePayload extends MessageBasePayload {
  rooms: {
    name: string;
    users: number;
    maxUsers: number;
  }[];
}
interface ChatPayload extends MessageBasePayload {
  chatMessage: ChatMessage;
}

export type RoomMessage =
  | { type: MessageType.RemoveUser; payload: RemoveUserPayload }
  | { type: MessageType.UserJoined; payload: UserJoinedPayload }
  | { type: MessageType.LeaveRoom; payload?: LeaveUserPayload }
  | { type: MessageType.StartGame; payload?: StartGamePayload }
  | { type: MessageType.TypingUpdate; payload: TypingUpdatePayload }
  | { type: MessageType.RoomUpdate; payload: RoomUpdatePayload }
  | { type: MessageType.AbortGame }
  | { type: MessageType.Rooms; payload: RoomsAvailablePayload }
  | { type: MessageType.Chat; payload: ChatPayload };
