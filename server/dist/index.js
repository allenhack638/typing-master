"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsManager = void 0;
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const cors_1 = __importDefault(require("cors"));
const app_1 = __importDefault(require("./app"));
const WSManager_1 = __importDefault(require("./managers/WSManager"));
const dbConnect_1 = require("./utils/dbConnect");
const envConfig_1 = __importDefault(require("./config/envConfig"));
const app = (0, express_1.default)();
(0, dbConnect_1.dbConnect)();
const httpServer = (0, http_1.createServer)(app);
const wsManager = new WSManager_1.default(httpServer);
exports.wsManager = wsManager;
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
app.use("/api/v1", app_1.default);
app.get("/", (req, res) => {
    res.send("Testing route");
});
const PORT = envConfig_1.default.PORT;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
