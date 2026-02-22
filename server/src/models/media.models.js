import mongoose, { Schema } from "mongoose";

const MediaSchema = new Schema(
  {
    title: {
      type: String,
      trim: true,
      // required: [true, "Title is required"],
    },
    genre: [
      {
        type: String,
        default: null,
      },
    ],
    synopsis: {
      type: String,
      default: null,
    },

    cloudinaryId: {
      type: String,
      // required: true,
    },
    displayUrl: {
      type: String,
      // required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    format: {
      type: String,
    },
    resolution: {
      width: Number,
      height: Number,
    },
    bytes: {
      type: Number,
    },
    thumbnailUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Media = mongoose.model("Media", MediaSchema);
