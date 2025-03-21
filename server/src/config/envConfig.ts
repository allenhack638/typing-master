import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

class Config {
  static get PORT(): number {
    return parseInt(process.env.PORT || "3000", 10);
  }

  static get MONGO_URI(): string {
    if (!process.env.MONGO_URI) {
      throw new Error("Missing MONGO_URI environment variable!");
    }
    return process.env.MONGO_URI;
  }

  static get JWT_SECRET_EXPIRY(): number {
    const value = process.env.JWT_SECRET_EXPIRY || "3600";
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
      throw new Error("Invalid JWT_SECRET_EXPIRY value! It must be a number.");
    }

    return parsedValue;
  }

  static get JWT_SECRET(): string {
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable!");
    }
    return process.env.JWT_SECRET;
  }

  static get COOLING_PERIOD_WS(): number {
    const value = process.env.COOLING_PERIOD_WS || "3000";
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
      throw new Error("Invalid COOLING_PERIOD_WS value! It must be a number.");
    }

    return parsedValue;
  }

  static get COOLING_PERIOD_HTTP(): number {
    const value = process.env.COOLING_PERIOD_HTTP || "3000";
    const parsedValue = parseInt(value, 10);

    if (isNaN(parsedValue)) {
      throw new Error(
        "Invalid COOLING_PERIOD_HTTP value! It must be a number."
      );
    }

    return parsedValue;
  }
}

export default Config;
