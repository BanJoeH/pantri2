import { type ActionFunctionArgs } from "@remix-run/cloudflare";
import { Auth } from "../lib.server/auth";

export function loader() {
  return null;
}

export async function action(args: ActionFunctionArgs) {
  const auth = new Auth(args.context);
  return await auth.logout(args.request, { redirectTo: "/" });
}
