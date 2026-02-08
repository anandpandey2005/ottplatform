import mongoose, { Schema } from "mongoose";
const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: [tue, "email must be non-empty"],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      trim: true,
      required: [true, "password must be non-empty"],
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
