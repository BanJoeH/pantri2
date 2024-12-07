import { relations } from "drizzle-orm/relations";
import { user, workspace } from "./schema";

export const workspaceRelations = relations(workspace, ({ one }) => ({
  user: one(user, {
    fields: [workspace.ownerId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  workspaces: many(workspace),
}));
