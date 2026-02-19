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
    emailOtp: {
      type: Number,
      default: null,
    },
    emailOtpExpiry: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", UserSchema);
