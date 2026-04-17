import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AskChatBody {
  prompt?: unknown;
  context?: unknown;
  userContext?: unknown;
}

interface AskFeedbackBody {
  question?: unknown;
  correctAnswer?: unknown;
  userAnswer?: unknown;
  evaluationLevel?: unknown;
  accuracyPercent?: unknown;
  diagnostics?: unknown;
}

const MODEL_NAME = "gemma-3-4b-it";
const OUTPUT_LANGUAGE =
  (process.env.AI_OUTPUT_LANGUAGE ?? "thai").trim().toLowerCase() === "english"
    ? "english"
    : "thai";

function getLanguageInstruction(style: "answer" | "feedback"): string {
  if (OUTPUT_LANGUAGE === "english") {
    return style === "answer"
      ? "Respond in English."
      : "Write feedback in English with medium-to-long detail (4-7 sentences).";
  }

  return style === "answer"
    ? "ตอบเป็นภาษาไทยเป็นหลัก โดยคงสูตร สัญลักษณ์ และคำศัพท์เฉพาะไว้ตามเดิมได้"
    : "เขียนฟีดแบ็กเป็นภาษาไทยเป็นหลัก (4-7 ประโยค) โดยคงสูตร/คำเฉพาะเป็นภาษาเดิมได้";
}

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
    getLanguageInstruction("answer"),
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

function buildFeedbackPrompt(
  question: string,
  correctAnswer: string,
  userAnswer: string,
  evaluationLevel: "correct" | "almost" | "incorrect",
  accuracyPercent: number,
  diagnostics: string,
): string {
  return [
    "You are a close friend helping another friend study.",
    getLanguageInstruction("feedback"),
    "Style: casual, warm, a bit playful, like friend-to-friend chat (not formal teacher tone).",
    "Important: You MUST follow the provided evaluation level. Do not override it.",
    "Rules:",
    "- Never label the learner as 'wrong', 'incorrect', or use harsh judgment words.",
    "- If evaluation is correct: celebrate naturally and explain why the thinking is good.",
    "- If evaluation is almost: praise what is already right, then mention what is still missing.",
    "- If evaluation is incorrect: be gentle and frame it as 'almost there' or 'missing some parts', then teach step-by-step.",
    "- Prefer wording like: 'ส่วนนี้ถูกแล้ว (A) แต่ยังขาดอีกนิดที่ (B)'.",
    "- Focus more on the student's answer analysis than simply dumping the final answer.",
    "- If you give the correct answer, do it after explaining what the student already got right.",
    "- End with one actionable next step.",
    "",
    "=== Evaluation (must follow) ===",
    `level: ${evaluationLevel}`,
    `accuracyPercent: ${accuracyPercent}`,
    `diagnostics: ${diagnostics || "(none)"}`,
    "",
    "=== Question ===",
    question || "(No question provided)",
    "",
    "=== Correct Answer ===",
    correctAnswer || "(No correct answer provided)",
    "",
    "=== User Answer ===",
    userAnswer || "(No user answer provided)",
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

export const askFeedback = async (
  req: Request<{}, {}, AskFeedbackBody>,
  res: Response,
): Promise<void> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ message: "Missing GEMINI_API_KEY in server env" });
    return;
  }

  const question =
    typeof req.body?.question === "string" ? req.body.question.trim() : "";
  const correctAnswer =
    typeof req.body?.correctAnswer === "string"
      ? req.body.correctAnswer.trim()
      : "";
  const userAnswer =
    typeof req.body?.userAnswer === "string" ? req.body.userAnswer.trim() : "";
  const evaluationLevelRaw =
    typeof req.body?.evaluationLevel === "string"
      ? req.body.evaluationLevel.trim().toLowerCase()
      : "";
  const evaluationLevel: "correct" | "almost" | "incorrect" =
    evaluationLevelRaw === "correct" ||
    evaluationLevelRaw === "almost" ||
    evaluationLevelRaw === "incorrect"
      ? evaluationLevelRaw
      : "incorrect";
  const accuracyPercentRaw =
    typeof req.body?.accuracyPercent === "number" ? req.body.accuracyPercent : 0;
  const accuracyPercent = Math.max(0, Math.min(100, Math.round(accuracyPercentRaw)));
  const diagnostics =
    typeof req.body?.diagnostics === "string" ? req.body.diagnostics.trim() : "";

  if (!question) {
    res.status(400).json({ message: "question is required" });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = buildFeedbackPrompt(
      question,
      correctAnswer,
      userAnswer,
      evaluationLevel,
      accuracyPercent,
      diagnostics,
    );
    const result = await model.generateContent(prompt);
    const feedback = result.response.text().trim();
    res.status(200).json({ feedback });
  } catch (error) {
    console.error("Gemini feedback request failed:", error);
    res.status(500).json({ message: "Gemini feedback request failed" });
  }
};
