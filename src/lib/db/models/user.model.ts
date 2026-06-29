import mongoose, { Schema, Document, Model } from "mongoose";
import { IUser } from "@/types/user";

// Combine the interface with Mongoose Document
export interface UserDocument extends Omit<IUser, "_id">, Document {
  _id: mongoose.Types.ObjectId;
}

const UserSchema = new Schema<UserDocument>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    photoURL: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["citizen", "authority", "admin"],
      default: "citizen",
      index: true,
    },
    jurisdiction: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    reputation: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in development
const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", UserSchema);

export default User;
