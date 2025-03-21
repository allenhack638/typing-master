import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export const validateRequestData =
  (schema: ZodSchema, type: "params" | "query" | "body" = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (type === "params") {
        req.params = schema.parse(req.params);
      } else if (type === "query") {
        req.query = schema.parse(req.query);
      } else {
        req.body = schema.parse(req.body);
      }
      next();
    } catch (error) {
      res.status(400).json({ message: `Invalid ${type} data`, errors: error });
    }
  };
