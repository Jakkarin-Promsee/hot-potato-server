import { Response } from "express";
import { Image } from "../models/image.model";
import { AuthRequest } from "../types";

// GET /images — all images for the logged-in user (latest first)
export const getImages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const images = await Image.find({ user_id: req.user!._id })
      .sort({ created_at: -1 })
      .lean();

    res.json(images);
  } catch {
    res.status(500).json({ message: "Failed to fetch images" });
  }
};

// POST /images — save a Cloudinary upload result
export const saveImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { public_id, url, secure_url, width, height, format, bytes } =
      req.body;

    if (!public_id || !secure_url) {
      res
        .status(400)
        .json({ message: "public_id, url, and secure_url are required" });
      return;
    }

    // Guard: one user can't overwrite another user's record
    const existing = await Image.findOne({ public_id });
    if (existing) {
      res.status(409).json({ message: "Image already saved" });
      return;
    }

    const image = await Image.create({
      user_id: req.user!._id,
      public_id,
      secure_url,
      width,
      height,
      format,
      bytes,
    });

    res.status(201).json(image);
  } catch {
    res.status(500).json({ message: "Failed to save image" });
  }
};

// DELETE /images/:public_id — delete one image (owner only)
export const deleteImage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    // public_id may contain slashes (e.g. "folder/name") — decode it
    const public_id = decodeURIComponent(req.params.public_id as string);

    const image = await Image.findOneAndDelete({
      public_id,
      user_id: req.user!._id, // scoped to owner — can't delete others' images
    });

    if (!image) {
      res.status(404).json({ message: "Image not found" });
      return;
    }

    res.json({ message: "Deleted", public_id });
  } catch {
    res.status(500).json({ message: "Failed to delete image" });
  }
};

// DELETE /images — clear all images for the logged-in user
export const clearImages = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    await Image.deleteMany({ user_id: req.user!._id });
    res.json({ message: "All images cleared" });
  } catch {
    res.status(500).json({ message: "Failed to clear images" });
  }
};
