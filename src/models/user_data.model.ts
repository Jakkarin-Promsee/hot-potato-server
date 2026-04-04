import { Schema, model, Document, Types } from "mongoose";

export interface IUserData extends Document {
  user_id: Types.ObjectId;
  avatar?: string;
  bio?: string;
  metadata: Record<string, any>; // flexible for future huge data
  updatedAt: Date;
}

const userDataSchema = new Schema<IUserData>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    avatar: { type: String },
    bio: { type: String },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const UserData = model<IUserData>("UserData", userDataSchema);
