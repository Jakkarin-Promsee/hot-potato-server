import mongoose, { Document, Schema } from "mongoose";

const imageSchema = new Schema<IImage>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    public_id: { type: String, required: true, unique: true },
    secure_url: { type: String, required: true },
    original_filename: { type: String, default: "" },
    format: { type: String, default: "" },
    bytes: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

export interface IImage extends Document {
  user_id: mongoose.Types.ObjectId;
  public_id: string;
  secure_url: string;
  original_filename: string;
  format: string;
  bytes: number;
  width: number;
  height: number;
  created_at: Date;
}

export const Image = mongoose.model<IImage>("Image", imageSchema);
