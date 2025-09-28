// index.js
import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("Mongo connected");
  app.listen(PORT, () => console.log("Server on http://localhost:" + PORT));
});
