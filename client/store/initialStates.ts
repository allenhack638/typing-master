import { DifficultyLevel } from "@/types/enums";
import { RoomState } from "@/types/types";

export const baseRoomState: RoomState = {
  id: null,
  name: "",
  maxUsers: 4,
  enableChat: true,
  users: [],
  privateRoom: false,
  difficulty: DifficultyLevel.BEGINNER,
  admin: null,
  gameState: null,
};
