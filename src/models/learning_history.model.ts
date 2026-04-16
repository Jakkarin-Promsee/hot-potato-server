import { Schema, model, Document, Types } from "mongoose";

/** One row per user per content: last time they opened or interacted with it. */
export interface ILearningHistory extends Document {
  user_id: Types.ObjectId;
  content_id: Types.ObjectId;
  last_accessed: Date;
}

const learningHistorySchema = new Schema<ILearningHistory>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content_id: { type: Schema.Types.ObjectId, ref: "Content", required: true },
    last_accessed: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

learningHistorySchema.index({ user_id: 1, content_id: 1 }, { unique: true });
learningHistorySchema.index({ user_id: 1, last_accessed: -1 });

export const LearningHistory = model<ILearningHistory>(
  "LearningHistory",
  learningHistorySchema,
);
