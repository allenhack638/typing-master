import { Router } from "express";
import {
  getRandomTemplate,
  insertTemplate,
} from "../controllers/TemplateController";
import { validateRequestData } from "../middlewares/zodMiddleware";
import { levelParamsSchema } from "../validators/roomValidator";

const TemplateRouter = Router();

TemplateRouter.get(
  "/:level",
  validateRequestData(levelParamsSchema, "params"),
  getRandomTemplate
);

TemplateRouter.post("/", insertTemplate);

export default TemplateRouter;
