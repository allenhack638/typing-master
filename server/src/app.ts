import { Router } from "express";
import RoomRouter from "./routes/RoomRouter";
import TemplateRouter from "./routes/TemplateRouter";

const AppRouter = Router();

AppRouter.use("/room", RoomRouter);
AppRouter.use("/templates", TemplateRouter);

export default AppRouter;
