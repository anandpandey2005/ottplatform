import dotenv from "dotenv";

dotenv.config({
  path: "../.env",
});
import { app } from "./app.js";

const PORT = process.env.PORT || 1090;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
