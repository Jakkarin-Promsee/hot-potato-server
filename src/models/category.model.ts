import mongoose, { Document, Schema } from "mongoose";

export interface ICategory extends Document {
  user_id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  created_at: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

// One user can't have two categories with the same name
categorySchema.index({ user_id: 1, name: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>("Category", categorySchema);
