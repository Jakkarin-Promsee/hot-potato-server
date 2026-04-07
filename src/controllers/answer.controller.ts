import { Response } from "express";
import { UserContent } from "../models/user_content.model";
import { AuthRequest } from "../types";

// GET /api/answer/:contentId
export const getAnswers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const userContent = await UserContent.findOne({
    user_id: req.user!._id,
    content_id: req.params.contentId,
  });

  // Return empty answers if first visit — not an error
  res.json(userContent?.answers ?? {});
};

// PUT /api/answer/:contentId
export const saveAnswer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { blockId, answer } = req.body;

  if (!blockId) {
    res.status(400).json({ message: "blockId is required" });
    return;
  }

  await UserContent.findOneAndUpdate(
    {
      user_id: req.user!._id,
      content_id: req.params.contentId,
    },
    {
      $set: {
        [`answers.${blockId}`]: answer,
        last_visited: new Date(),
      },
    },
    { upsert: true, returnDocument: "after" },
  );

  res.json({ success: true });
};

// PUT /api/answer/:contentId/bulk
export const bulkSaveAnswers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { answers } = req.body;

  await UserContent.findOneAndUpdate(
    { user_id: req.user!._id, content_id: req.params.contentId },
    { $set: { answers, last_visited: new Date() } },
    { upsert: true, returnDocument: "after" },
  );

  res.json({ success: true });
};
