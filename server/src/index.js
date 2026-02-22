import dotenv from "dotenv/config";

import { app } from "./app.js";
import connectDB from "./config/databaseConnection.config.js";

const PORT = process.env.PORT || 1090;

app.listen(PORT, () => {
  connectDB();
  console.log(`http://localhost:${PORT}`);
});
