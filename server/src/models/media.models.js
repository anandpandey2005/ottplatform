import mongoose, { Schema } from "mongoose";
const MediaSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "name msut be non-empty"],
    },
    
  },
  { timestamps: true },
);

export const Media = mongoose.model("Media", MediaSchema);
