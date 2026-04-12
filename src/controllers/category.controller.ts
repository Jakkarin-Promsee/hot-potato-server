import { Response } from "express";
import { Category } from "../models/category.model";
import { Image } from "../models/image.model";
import { AuthRequest } from "../types";

// GET /categories
export const getCategories = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const categories = await Category.find({ user_id: req.user!._id })
      .sort({ created_at: -1 })
      .lean();
    res.json(categories);
  } catch {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

// POST /categories
export const createCategory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name?.trim()) {
      res.status(400).json({ message: "name is required" });
      return;
    }

    const category = await Category.create({
      user_id: req.user!._id,
      name: name.trim(),
      description,
    });
    res.status(201).json(category);
  } catch (err: any) {
    // Duplicate name for this user
    if (err.code === 11000) {
      res.status(409).json({ message: "Category name already exists" });
      return;
    }
    res.status(500).json({ message: "Failed to create category" });
  }
};

// PATCH /categories/:id
export const updateCategory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user!._id },
      { name: name?.trim(), description },
      { new: true, runValidators: true },
    );
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }
    res.json(category);
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(409).json({ message: "Category name already exists" });
      return;
    }
    res.status(500).json({ message: "Failed to update category" });
  }
};

// DELETE /categories/:id
export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user!._id,
    });
    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    // Unlink images that belonged to this category
    await Image.updateMany(
      { category_id: category._id },
      { $set: { category_id: null } },
    );

    res.json({ message: "Deleted", id: req.params.id });
  } catch {
    res.status(500).json({ message: "Failed to delete category" });
  }
};

// GET /categories/:id/images
export const getImagesByCategory = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const images = await Image.find({
      user_id: req.user!._id,
      category_id: req.params.id,
    })
      .sort({ created_at: -1 })
      .lean();
    res.json(images);
  } catch {
    res.status(500).json({ message: "Failed to fetch images" });
  }
};
