import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AskChatBody {
  prompt?: unknown;
  context?: unknown;
  userContext?: unknown;
}

const MODEL_NAME = "gemma-3-4b-it";

function buildLearningPrompt(
  prompt: string,
  context: string,
  userContext: string,
): string {
  return [
    "You are a learning assistant.",
    "Use the provided learning content as the primary context.",
    "Use prior learner chat history as secondary context.",
    "If the answer is not clearly in the content, say what is missing and give best-effort guidance.",
    "Keep the explanation clear, practical, and directly related to the learner question.",
    "Return the question with thai language.",
    "",
    "=== Learning Content ===",
    context || "(No learning content provided)",
    "",
    "=== Learner Chat History ===",
    userContext || "(No prior learner chat context provided)",
    "",
    "=== Learner Question ===",
    prompt,
  ].join("\n");
}

export const askChat = async (
  req: Request<{}, {}, AskChatBody>,
  res: Response,
): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ message: "Missing GEMINI_API_KEY in server env" });
    return;
  }

  const prompt =
    typeof req.body?.prompt === "string" ? req.body.prompt.trim() : "";
  const context =
    typeof req.body?.context === "string" ? req.body.context.trim() : "";
  const userContext =
    typeof req.body?.userContext === "string"
      ? req.body.userContext.trim()
      : "";

  if (!prompt) {
    res.status(400).json({ message: "prompt is required" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const finalPrompt = buildLearningPrompt(prompt, context, userContext);
    const result = await model.generateContent(finalPrompt);
    const answer = result.response.text().trim();

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Gemini request failed:", error);
    res.status(500).json({ message: "Gemini request failed" });
  }
};
