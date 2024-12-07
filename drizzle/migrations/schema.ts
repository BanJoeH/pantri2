import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { newId } from "../../app/id";

export const user = sqliteTable(
  "user",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    name: text("name").notNull(),
    email: text("email"),
    externalId: text("external_id")
      .notNull()
      .$defaultFn(() => newId({ prefix: "user" })),
    encryptedPassword: text("encrypted_password"),
    createdAt: integer("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: integer("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull()
      .$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      external_id_unique: uniqueIndex("user_external_id_unique").on(
        table.externalId,
      ),
      email_unique: uniqueIndex("user_email_unique").on(table.email),
    };
  },
);

export const workspace = sqliteTable(
  "workspace",
  {
    id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
    externalId: text("external_id")
      .notNull()
      .$defaultFn(() => newId({ prefix: "workspace" })),
    name: text("name").notNull(),
    ownerId: integer("owner_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull(),
    updatedAt: integer("updated_at")
      .default(sql`(CURRENT_TIMESTAMP)`)
      .notNull()
      .$onUpdateFn(() => sql`(CURRENT_TIMESTAMP)`),
  },
  (table) => {
    return {
      external_id_unique: uniqueIndex("workspace_external_id_unique").on(
        table.externalId,
      ),
    };
  },
);

export const userToWorkspace = sqliteTable(
  "user_to_workspace",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => workspace.id, { onDelete: "cascade" }),
  },
  (table) => {
    return {
      user_id_workspace_id_unique: uniqueIndex(
        "user_to_workspace_user_id_workspace_id_unique",
      ).on(table.userId, table.workspaceId),
    };
  },
);
