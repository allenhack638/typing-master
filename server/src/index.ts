import express from "express";
import { createServer } from "http";
import cors from "cors";
import AppRouter from "./app";
import WSManager from "./managers/WSManager";
import { dbConnect } from "./utils/dbConnect";
import Config from "./config/envConfig";

const app = express();

dbConnect();

const httpServer = createServer(app);
const wsManager = new WSManager(httpServer);

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "https://typing-master.allenbenny.site"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1", AppRouter);

app.get("/", (req, res) => {
  res.send("Testing route");
});

const PORT = Config.PORT;
httpServer.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export { wsManager };
