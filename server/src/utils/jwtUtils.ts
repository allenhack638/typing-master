import jwt from "jsonwebtoken";
import Config from "../config/envConfig";

const SECRET_KEY = Config.JWT_SECRET;
const SECRET_EXPIRY = Config.JWT_SECRET_EXPIRY;

export const generateToken = (
  payload: object,
  expiresIn: number = SECRET_EXPIRY
) => {
  return jwt.sign(payload, SECRET_KEY, { expiresIn });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};

export const refreshToken = (token: string, newExpiresIn = SECRET_EXPIRY) => {
  const decoded = verifyToken(token);
  if (!decoded || typeof decoded === "string") return null;
  const { iat, exp, ...payload } = decoded;
  return generateToken(payload, newExpiresIn);
};
