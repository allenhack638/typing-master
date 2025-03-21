import { Document } from "mongoose";
import { DifficultyLevel } from "./common";

export interface TypingTemplate extends Document {
  level: DifficultyLevel;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}
