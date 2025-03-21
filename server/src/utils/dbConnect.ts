import mongoose from "mongoose";
import Config from "../config/envConfig";
import TypingTemplateModel from "../models/TypingTemplateModel";
import { templates } from "../data/seedData";

export const dbConnect = async () => {
  try {
    const MONGO_URI = Config.MONGO_URI;
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully");

    await seedTemplates();
  } catch (error) {
    console.error("⛔ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const seedTemplates = async () => {
  try {
    const count = await TypingTemplateModel.countDocuments();

    if (count === 0) {
      console.log("🌱 Seeding default templates...");

      await TypingTemplateModel.insertMany(templates);
      console.log("✅ Seed data inserted successfully!");
    } else {
      console.log("✅ Seed data already exists, skipping insertion.");
    }
  } catch (error) {
    console.error("⛔ Error while seeding data:", error);
  }
};
