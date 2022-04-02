import { createCookieSessionStorage } from "@remix-run/node";

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "__session",
      secrets: ["fancy-secret-key"],
      maxAge: 60 * 60 * 24 * 365 , // 1 year
      sameSite: "lax",
      path: "/",
      httpOnly: true,
    },
  });