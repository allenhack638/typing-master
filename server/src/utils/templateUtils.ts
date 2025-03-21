import TypingTemplateModel from "../models/TypingTemplateModel";
import { DifficultyLevel } from "../types/common";

export const getRandomTypingTemplate = async (level: DifficultyLevel) => {
  if (!Object.values(DifficultyLevel).includes(level)) {
    throw new Error("Invalid difficulty level");
  }

  const templates = await TypingTemplateModel.find({ level });

  if (templates.length === 0) {
    throw new Error("No templates found for this level");
  }

  return templates[Math.floor(Math.random() * templates.length)];
};
