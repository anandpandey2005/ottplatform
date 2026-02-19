import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import check from "./utils/otp.utils.js";

const app = express();

app.use(
  cors({
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ saying: "Hello" });
});

// setInterval(() => {
//   check();
// }, 1000);
export { app };
