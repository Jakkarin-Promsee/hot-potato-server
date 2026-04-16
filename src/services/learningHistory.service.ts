import { Types } from "mongoose";
import { LearningHistory } from "../models/learning_history.model";

/** Upsert last_accessed — shared by history visit, answer saves. */
export async function touchLearningHistory(
  userId: Types.ObjectId,
  contentId: Types.ObjectId,
): Promise<void> {
  await LearningHistory.findOneAndUpdate(
    { user_id: userId, content_id: contentId },
    { $set: { last_accessed: new Date() } },
    { upsert: true },
  );
}
