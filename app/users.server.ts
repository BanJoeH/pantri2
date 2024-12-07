import { randomBytes, scryptSync } from "crypto";
import { user, userToWorkspace, workspace } from "../drizzle/migrations/schema";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { eq, getTableColumns } from "drizzle-orm";
import { jsonAggObj } from "../drizzle/db";

// Pass the password string and get hashed password back
// ( and store only the hashed string in your database)
const encryptPassword = (password: string, salt: string) => {
  return scryptSync(password, salt, 32).toString("hex");
};

/**
 * Hash password with random salt
 * @return {string} password hash followed by salt
 *  XXXX till 64 XXXX till 32
 *
 */
export const hashPassword = (password: string): string => {
  // Any random string here (ideally should be at least 16 bytes)
  const salt = randomBytes(16).toString("hex");
  return encryptPassword(password, salt) + salt;
};

// fetch the user from your db and then use this function

/**
 * Match password against the stored hash
 */
export const matchPassword = (password: string, hash: string) => {
  // extract salt from the hashed string
  // our hex password length is 32*2 = 64
  const salt = hash.slice(64);
  const originalPassHash = hash.slice(0, 64);
  const currentPassHash = encryptPassword(password, salt);
  return originalPassHash === currentPassHash;
};

export async function createUser(
  db: LibSQLDatabase,
  data: Prettify<
    Omit<
      typeof user.$inferInsert,
      "id" | "createdAt" | "updatedAt" | "externalId"
    >
  >,
) {
  return db.insert(user).values(data).onConflictDoNothing().returning();
}

export async function getUser(
  db: LibSQLDatabase,
  where: ReturnType<typeof eq>,
) {
  const userColumns = getTableColumns(user);
  const workspaceColumns = getTableColumns(workspace);
  const query = db
    .select({
      ...userColumns,
      workspaces: jsonAggObj(workspace.id, { ...workspaceColumns }),
    })
    .from(user)
    .leftJoin(userToWorkspace, eq(user.id, userToWorkspace.userId))
    .leftJoin(workspace, eq(workspace.id, userToWorkspace.workspaceId))
    .where(where)
    .groupBy(user.id);
  return query;
}

export async function getUserByEmail(db: LibSQLDatabase, email: string) {
  return getUser(db, eq(user.email, email));
}

export async function getUserById(db: LibSQLDatabase, id: number) {
  return getUser(db, eq(user.id, id));
}

export async function getUserByExternalId(
  db: LibSQLDatabase,
  externalId: string,
) {
  return getUser(db, eq(user.externalId, externalId));
}

export async function updateUser(
  db: LibSQLDatabase,
  data: typeof user.$inferSelect,
) {
  return db.update(user).set(data).where(eq(user.id, data.id));
}

export async function deleteUser(db: LibSQLDatabase, id: number) {
  return db.delete(user).where(eq(user.id, id));
}

// export async function findOrCreateUser(
//   db: LibSQLDatabase,
//   email: string,
//   name: string,
// ) {
//   const user = createUser(db, { name, email });
// }

export async function createAnonymousUser(db: LibSQLDatabase) {
  const [created] = await createUser(db, { name: "Anonymous" });
  if (!created) throw new Error("Failed to create anonymous user");
  const user = await getUserById(db, created.id);
  return user;
}

export async function attemptLogin(
  db: LibSQLDatabase,
  email: string,
  password: string,
) {
  const [user] = await getUserByEmail(db, email);
  if (!user) return null;

  if (!user.encryptedPassword) return null;
  if (!matchPassword(password, user.encryptedPassword)) return null;
  return user;
}

export async function claimAccount(
  db: LibSQLDatabase,
  {
    name,
    email,
    externalId,
    password,
  }: { name: string; email: string; externalId: string; password: string },
) {
  return db
    .update(user)
    .set({ name, email, encryptedPassword: hashPassword(password) })
    .where(eq(user.externalId, externalId));
}

export async function deleteAccount(
  db: LibSQLDatabase,
  u: typeof user.$inferSelect,
) {
  return db.delete(user).where(eq(user.id, u.id));
}
