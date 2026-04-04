import { Schema, model, Document, Types } from "mongoose";

export interface IContent extends Document {
  owner_id: Types.ObjectId;
  collaborators: Types.ObjectId[];
  title: string;
  tiptap_json: string;
  access_type: "public" | "link-only" | "private";
  createdAt: Date;
  updatedAt: Date;
}

const contentSchema = new Schema<IContent>(
  {
    owner_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    collaborators: [{ type: Schema.Types.ObjectId, ref: "User" }],
    title: { type: String, required: true, trim: true },
    tiptap_json: { type: String, required: true },
    access_type: {
      type: String,
      enum: ["public", "link-only", "private"],
      default: "private",
    },
  },
  { timestamps: true },
);

export const Content = model<IContent>("Content", contentSchema);
