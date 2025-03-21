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
exports.getRandomTypingTemplate = void 0;
const TypingTemplateModel_1 = __importDefault(require("../models/TypingTemplateModel"));
const common_1 = require("../types/common");
const getRandomTypingTemplate = (level) => __awaiter(void 0, void 0, void 0, function* () {
    if (!Object.values(common_1.DifficultyLevel).includes(level)) {
        throw new Error("Invalid difficulty level");
    }
    const templates = yield TypingTemplateModel_1.default.find({ level });
    if (templates.length === 0) {
        throw new Error("No templates found for this level");
    }
    return templates[Math.floor(Math.random() * templates.length)];
});
exports.getRandomTypingTemplate = getRandomTypingTemplate;
