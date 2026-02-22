import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { getMedia } from "./controller/getMedia.controller.js";
import { createMedia, deleteMedia } from "./controller/upload.controller.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDirectory = path.join(__dirname, "../uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    const extFromName = path.extname(file.originalname);
    const extFromType = file?.mimetype?.split("/")[1];
    const extension = extFromName || (extFromType ? `.${extFromType}` : ".mp4");
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (file?.mimetype?.startsWith("video/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only video files are allowed"));
  },
});

app.use(
  cors({
    // Dynamically allow the origin of the requester
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use("/uploads", express.static(uploadDirectory));

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

app.get("/health", (req, res) => {
  const isDatabaseReady = mongoose.connection.readyState === 1;

  return res.status(isDatabaseReady ? 200 : 503).json({
    success: isDatabaseReady,
    database: isDatabaseReady ? "connected" : "disconnected",
  });
});

app.get("/media", getMedia);
app.get("/getMedia", getMedia);

app.post("/upload", upload.any(), createMedia);
app.delete("/media/:mediaId", deleteMedia);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err) {
    return res.status(400).json({ success: false, message: err.message });
  }

  next();
});

export { app };
