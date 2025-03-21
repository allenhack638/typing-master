"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomTemplate = exports.insertTemplate = void 0;
const TypingTemplateModel_1 = __importDefault(require("../models/TypingTemplateModel"));
const common_1 = require("../types/common");
const templateUtils_1 = require("../utils/templateUtils");
const constants_1 = require("../config/constants");
const envConfig_1 = __importDefault(require("../config/envConfig"));
const templates = [
    {
        level: common_1.DifficultyLevel.BEGINNER,
        text: "The quick brown fox jumps over the lazy dog.",
    },
    {
        level: common_1.DifficultyLevel.BEGINNER,
        text: "Typing fast is a great skill to learn.",
    },
    {
        level: common_1.DifficultyLevel.BEGINNER,
        text: "Practice makes perfect in everything we do.",
    },
    {
        level: common_1.DifficultyLevel.EASY,
        text: "Learning to type faster improves productivity and efficiency.",
    },
    {
        level: common_1.DifficultyLevel.EASY,
        text: "Good typing speed allows you to complete tasks with greater ease.",
    },
    {
        level: common_1.DifficultyLevel.EASY,
        text: "Accuracy in typing is just as important as speed.",
    },
    {
        level: common_1.DifficultyLevel.EXPERT,
        text: "Mastering the art of typing requires patience, practice, and persistence.",
    },
    {
        level: common_1.DifficultyLevel.EXPERT,
        text: "The ability to type at a high speed while maintaining accuracy is a valuable skill in the digital age.",
    },
    {
        level: common_1.DifficultyLevel.EXPERT,
        text: "Typing fluently without looking at the keyboard is a hallmark of a skilled typist.",
    },
    {
        level: common_1.DifficultyLevel.LEGEND,
        text: "In the pursuit of excellence, rapid typing transcends mere dexterity, evolving into an art form.",
    },
    {
        level: common_1.DifficultyLevel.LEGEND,
        text: "Efficiency in keyboard navigation significantly influences overall digital fluency and performance.",
    },
    {
        level: common_1.DifficultyLevel.LEGEND,
        text: "To type swiftly and accurately is to wield the power of communication with unparalleled mastery.",
    },
];
const insertTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield TypingTemplateModel_1.default.insertMany(templates);
        res.status(201).json({ message: "Typing templates inserted successfully" });
    }
    catch (error) {
        console.error("Error inserting templates:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.insertTemplate = insertTemplate;
const getRandomTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { level } = req.params;
        const randomTemplate = yield (0, templateUtils_1.getRandomTypingTemplate)(level);
        const threshold_time = envConfig_1.default.COOLING_PERIOD_HTTP;
        res.status(200).json({
            data: {
                textContent: randomTemplate.text,
                startTime: Date.now() + threshold_time,
                status: common_1.GameStatus.COOLING_PERIOD,
                endTime: Date.now() + threshold_time + constants_1.GAME_TIMERS[level],
            },
        });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unexpected error occurred" });
        }
    }
});
exports.getRandomTemplate = getRandomTemplate;
