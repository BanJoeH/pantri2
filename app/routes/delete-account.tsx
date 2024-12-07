import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Auth } from "../lib.server/auth";
import { Form } from "@remix-run/react";
import { deleteAccount } from "../users.server";
import { getDb } from "../../drizzle/db";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = new Auth(context);
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return user;
}

export async function action({ request, context }: ActionFunctionArgs) {
  const auth = new Auth(context);
  const user = await auth.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const db = getDb(context);

  await deleteAccount(db, user);
  return auth.logout(request, {
    redirectTo: "/",
  });
}

export default function DeleteAccount() {
  return (
    <>
      <h1>Delete Account</h1>
      <Form method="POST">
        <button type="submit">Delete Account</button>
      </Form>
    </>
  );
}
