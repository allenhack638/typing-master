import { Request, Response } from "express";
import TypingTemplateModel from "../models/TypingTemplateModel";
import { DifficultyLevel, GameStatus } from "../types/common";
import { getRandomTypingTemplate } from "../utils/templateUtils";
import { GAME_TIMERS } from "../config/constants";
import Config from "../config/envConfig";
import { templates } from "../data/seedData";

export const insertTemplate = async (req: Request, res: Response) => {
  try {
    await TypingTemplateModel.insertMany(templates);
    res.status(201).json({ message: "Typing templates inserted successfully" });
  } catch (error) {
    console.error("Error inserting templates:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRandomTemplate = async (req: Request, res: Response) => {
  try {
    const { level } = req.params;

    const randomTemplate = await getRandomTypingTemplate(
      level as DifficultyLevel
    );

    const threshold_time = Config.COOLING_PERIOD_HTTP;

    res.status(200).json({
      data: {
        textContent: randomTemplate.text,
        startTime: Date.now() + threshold_time,
        status: GameStatus.COOLING_PERIOD,
        endTime:
          Date.now() + threshold_time + GAME_TIMERS[level as DifficultyLevel],
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};
