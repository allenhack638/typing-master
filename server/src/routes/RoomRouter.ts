import { Router } from "express";
import {
  AvailableRooms,
  CreateRoom,
  GetRoom,
  JoinRoom,
  UpdateRoom,
} from "../controllers/RoomControllers";
import { authenticateToken } from "../middlewares/authToken";
import { validateRequestData } from "../middlewares/zodMiddleware";
import {
  createRoomSchema,
  roomNameParamsSchema,
  userIdQuerySchema,
  tokenQuerySchema,
  updateRoomSchema,
} from "../validators/roomValidator";

const RoomRouter = Router();

RoomRouter.get("/available", AvailableRooms);

RoomRouter.get(
  "/:roomName",
  validateRequestData(tokenQuerySchema, "query"),
  validateRequestData(roomNameParamsSchema, "params"),
  authenticateToken,
  GetRoom
);

RoomRouter.put(
  "/:roomName",
  validateRequestData(updateRoomSchema),
  validateRequestData(roomNameParamsSchema, "params"),
  authenticateToken,
  UpdateRoom
);

RoomRouter.get(
  "/join/:roomName",
  validateRequestData(userIdQuerySchema, "query"),
  validateRequestData(roomNameParamsSchema, "params"),
  JoinRoom
);

RoomRouter.post("/", validateRequestData(createRoomSchema), CreateRoom);

export default RoomRouter;
