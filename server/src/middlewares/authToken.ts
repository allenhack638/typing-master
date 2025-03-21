import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Config from "../config/envConfig";
import { User } from "../types/user";

const SECRET_KEY = Config.JWT_SECRET;

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { token } = req.query;
  if (!token || typeof token !== "string") {
    res
      .status(401)
      .json({ error: "Unauthorized: Token is missing or invalid" });
    return;
  }

  try {
    const decoded: User = jwt.verify(token, SECRET_KEY) as User;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: "Forbidden: Invalid token" });
  }
};
