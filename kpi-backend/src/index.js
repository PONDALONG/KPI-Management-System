import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`API listening on :${PORT}`);
    });
  } catch (e) {
    console.error("Mongo connect error:", e.message);
    process.exit(1);
  }
}

start();
