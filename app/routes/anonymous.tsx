import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { Auth } from "../lib.server/auth";

export async function loader({ context, request }: LoaderFunctionArgs) {
  const auth = new Auth(context);
  return await auth.authenticate("formOrNull", request, {
    successRedirect: "/claim-account",
  });
}
