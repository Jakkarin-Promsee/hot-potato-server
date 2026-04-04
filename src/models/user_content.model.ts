import { Schema, model, Document, Types } from "mongoose";

export interface IUserContent extends Document {
  user_id: Types.ObjectId;
  content_id: Types.ObjectId;
  answers: Map<string, any>; // key = component_id, value = answer
  last_visited: Date;
}

const userContentSchema = new Schema<IUserContent>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content_id: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    answers: { type: Map, of: Schema.Types.Mixed, default: {} },
    last_visited: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Compound index — one record per user per content
userContentSchema.index({ user_id: 1, content_id: 1 }, { unique: true });

export const UserContent = model<IUserContent>(
  "UserContent",
  userContentSchema,
);
