import { Types } from "mongoose";
import { User } from "../models/user.model";

export type AuthorSnapshot = {
  author_name: string;
  collaborator_names: string[];
};

/**
 * Denormalized display names: owner + collaborators in collaborator[] order.
 * Call on content create and whenever collaborators[] changes.
 */
export async function buildAuthorSnapshot(
  ownerId: Types.ObjectId,
  collaboratorIds: Types.ObjectId[],
): Promise<AuthorSnapshot> {
  const owner = await User.findById(ownerId).select("name").lean();
  const author_name = owner?.name?.trim() || "Unknown";

  if (!collaboratorIds?.length) {
    return { author_name, collaborator_names: [] };
  }

  const collabDocs = await User.find({ _id: { $in: collaboratorIds } })
    .select("name")
    .lean();

  const byId = new Map(
    collabDocs.map((u) => [String(u._id), u.name?.trim() || "Unknown"]),
  );

  const collaborator_names = collaboratorIds.map(
    (id) => byId.get(String(id)) ?? "Unknown",
  );

  return { author_name, collaborator_names };
}
