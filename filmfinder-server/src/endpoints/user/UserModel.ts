import { Schema, model } from "mongoose";

export interface UserData {
  email: string;
  passwordHash: string;
}

const userSchema = new Schema<UserData>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export const User = model<UserData>("User", userSchema);
