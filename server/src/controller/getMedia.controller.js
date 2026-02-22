import { Media } from "../models/media.models.js";
import mongoose from "mongoose";

const getMedia = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: "Database is not connected",
      });
    }

    const mediaList = await Media.find().sort({ createdAt: -1 });

    if (!mediaList || mediaList.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No media found in the library",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      count: mediaList.length,
      data: mediaList,
    });
  } catch (err) {
    console.error("GetMedia Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve media",
      error: err.message,
    });
  }
};

export { getMedia };
