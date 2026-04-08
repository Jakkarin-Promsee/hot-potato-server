import { Response } from "express";
import { Content } from "../models/content.model";
import { AuthRequest } from "../types";

// GET /api/content/load?id=xx
export const loadContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const content = await Content.findById(req.query.id);

  if (!content) {
    res.status(404).json({ message: "Content not found" });
    return;
  }

  // Check access permission
  const isOwner = content.owner_id.toString() === req.user!._id.toString();
  const isCollaborator = content.collaborators
    .map((c) => c.toString())
    .includes(req.user!._id.toString());
  const isPublic = content.access_type === "public";

  if (!isPublic && !isOwner && !isCollaborator) {
    res.status(403).json({ message: "No permission to view this content" });
    return;
  }

  res.json(content);
};

// POST /api/content/create
export const createBlankContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const content = await Content.create({
    owner_id: req.user!._id,
    // everything else uses schema defaults
  });

  res.status(201).json({ content_id: content._id });
};

// PUT /api/content/:id
// if {clientUpdatedAt:""} -> return confilct if db have lastest
// if not -> force saving it
export const updateContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { clientUpdatedAt, ...updateData } = req.body;

  const content = await Content.findById(req.params.id);

  if (!content) {
    res.status(404).json({ message: "Content not found" });
    return;
  }

  // ── Version check ──────────────────────────────────────────────
  if (clientUpdatedAt) {
    const serverTime = new Date(content.updatedAt).getTime();
    const clientTime = new Date(clientUpdatedAt).getTime();

    if (clientTime < serverTime) {
      res.status(409).json({
        message: "Conflict: a newer version exists on the server.",
        serverUpdatedAt: content.updatedAt,
      });
      return;
    }
  }

  const isOwner = content.owner_id.toString() === req.user!._id.toString();
  const isCollaborator = content.collaborators
    .map((c) => c.toString())
    .includes(req.user!._id.toString());

  if (!isOwner && !isCollaborator) {
    res.status(403).json({ message: "No permission to edit this content" });
    return;
  }

  const updated = await Content.findByIdAndUpdate(
    req.params.id,
    { ...updateData },
    { returnDocument: "after" },
  );

  res.json(updated);
};

// DELETE /api/content/:id
export const deleteContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const content = await Content.findById(req.params.id);

  if (!content) {
    res.status(404).json({ message: "Content not found" });
    return;
  }

  // Only owner can delete
  const isOwner = content.owner_id.toString() === req.user!._id.toString();
  if (!isOwner) {
    res.status(403).json({ message: "Only owner can delete this content" });
    return;
  }

  await Content.findByIdAndDelete(req.params.id);
  res.json({ message: "Content deleted" });
};

// GET /api/content/search?q=title&mine=true
export const searchContent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { q, mine } = req.query;

  const filter: Record<string, any> = {};

  // Filter by user (owner or collaborator)
  if (mine === "true") {
    filter["$or"] = [
      { owner_id: req.user!._id },
      { collaborators: req.user!._id },
    ];
  }

  // Filter by title text
  if (q) {
    const titleFilter = { title: { $regex: q, $options: "i" } }; // case insensitive

    // Combine with mine filter if both provided
    if (filter["$or"]) {
      filter["$and"] = [{ $or: filter["$or"] }, titleFilter];
      delete filter["$or"];
    } else {
      filter["title"] = titleFilter.title;
    }
  }

  const contents = await Content.find(filter).select(
    "_id title title_image updatedAt",
  );

  res.json(contents);
};
