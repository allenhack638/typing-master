import mongoose, { Schema } from "mongoose";
import { TypingTemplate } from "../types/models";
import { DifficultyLevel } from "../types/common";

const TypingTemplateSchema = new Schema<TypingTemplate>(
  {
    level: {
      type: String,
      enum: Object.values(DifficultyLevel),
      required: true,
    },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<TypingTemplate>(
  "TypingTemplate",
  TypingTemplateSchema
);
