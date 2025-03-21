"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameStatus = exports.MessageType = exports.DifficultyLevel = void 0;
var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel["BEGINNER"] = "Beginner";
    DifficultyLevel["EASY"] = "Easy";
    DifficultyLevel["EXPERT"] = "Expert";
    DifficultyLevel["LEGEND"] = "Legend";
})(DifficultyLevel || (exports.DifficultyLevel = DifficultyLevel = {}));
var MessageType;
(function (MessageType) {
    MessageType["RemoveUser"] = "remove-user";
    MessageType["UserJoined"] = "user-joined";
    MessageType["LeaveRoom"] = "leave-room";
    MessageType["StartGame"] = "start-game";
    MessageType["TypingUpdate"] = "typing-update";
    MessageType["RoomUpdate"] = "room-update";
    MessageType["AbortGame"] = "abort-game";
    MessageType["Rooms"] = "rooms";
    MessageType["Chat"] = "chat";
})(MessageType || (exports.MessageType = MessageType = {}));
var GameStatus;
(function (GameStatus) {
    GameStatus["COOLING_PERIOD"] = "cooling-period";
    GameStatus["GAME_STARTED"] = "game-started";
    GameStatus["GAME_ENDED"] = "game-ended";
})(GameStatus || (exports.GameStatus = GameStatus = {}));
