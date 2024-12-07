import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { Auth } from "../lib.server/auth";
import { createUser, hashPassword } from "../users.server";
import { getDb } from "../../drizzle/db";
import { Form } from "@remix-run/react";

export async function loader(args: LoaderFunctionArgs) {
  const auth = new Auth(args.context);
  const user = await auth.isAuthenticated(args.request);
  if (user) {
    return redirect(`/`);
  }
  return {};
}

export async function action(args: ActionFunctionArgs) {
  const request = args.request.clone();
  const db = getDb(args.context);
  const formData = await request.formData();
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const name = String(formData.get("name"));
  if (!email || !password || !name) {
    throw new Error("Email, password and name are required");
  }
  const encryptedPassword = hashPassword(password);
  const newUser = await createUser(db, {
    email,
    name,
    encryptedPassword,
  });
  // console.log(newUser);
  return newUser;
}

export default function Signup() {
  return (
    <div>
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
    </div>
  );
}
