import dotenv from "dotenv/config";

import { app } from "./app.js";
import connectDB from "./config/databaseConnection.config.js";

const PORT = process.env.PORT || 1090;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
