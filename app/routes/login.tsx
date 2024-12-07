import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "@remix-run/cloudflare";
// import { getDb } from "../../drizzle/db";
// import { createUser, hashPassword } from "../users.server";
import { Form, Link, redirect, useLoaderData } from "@remix-run/react";
import { Auth } from "../lib.server/auth";

export async function loader(args: LoaderFunctionArgs) {
  const auth = new Auth(args.context);
  const user = await auth.isAuthenticated(args.request, {});
  if (user && user.authenticated) {
    return redirect("/");
  }
  if (user) {
    return redirect("/claim-account");
  }
  return null;
}

export async function action(args: ActionFunctionArgs) {
  const auth = new Auth(args.context);
  return await auth.authenticate("form", args.request, {
    successRedirect: "/",
    failureRedirect: "/login",
    throwOnError: false,
    context: args.context,
  });
}

export default function Login() {
  const loaderData = useLoaderData<typeof loader>();
  console.log(loaderData);
  return (
    <>
      <Form
        method="POST"
        className="flex flex-col gap-4 border-2 border-gray-300 rounded-md p-4"
      >
        <h2>Login</h2>
        <label className="flex flex-col gap-2">
          Email:{" "}
          <input
            name="email"
            type="email"
            className="border-2 border-gray-300 rounded-md p-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          Password:{" "}
          <input
            name="password"
            type="password"
            className="border-2 border-gray-300 rounded-md p-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          Name:{" "}
          <input
            name="name"
            type="text"
            className="border-2 border-gray-300 rounded-md p-2"
          />
        </label>
        <button type="submit" className="bg-gray-500 text-white p-2">
          Submit
        </button>
      </Form>
      <Link to="/signup">Signup</Link>
    </>
  );
}
