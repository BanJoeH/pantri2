import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useRef } from "react";

import { requireAuth } from "~/server/auth.server";
import type { Recipe } from "~/server/db.server";
import { addRecipe, getUserRecipes, removeRecipe } from "~/server/db.server";

type LoaderData = {
  message: string;
  todos: Recipe[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAuth(request);
  const todos = await getUserRecipes(user.uid);
  console.log(todos)
  return json<LoaderData>({
    message: `Hello ${user.displayName || "unknown"}!`,
    todos,
  });
};

export type ActionData = {
  error: string;
};

export const action: ActionFunction = async ({ request }) => {
  const { uid } = await requireAuth(request);
  const form = await request.formData();
  if (request.method === "POST") {
    const title = form.get("title");
    if (typeof title !== "string")
      return json<ActionData>({ error: "title is required" }, { status: 400 });

    await addRecipe(uid, title);
    return redirect("/");
  }
  if (request.method === "DELETE") {
    const id = form.get("id");
    if (typeof id !== "string")
      return json<ActionData>({ error: "id is required" }, { status: 400 });
    await removeRecipe(uid, id);
    return redirect("/");
  }
  return json<ActionData>({ error: "unknown method" }, { status: 400 });
};

const RecipeComponent: React.FC<{ id: string; title: string }> = (props) => {
  const fetcher = useFetcher();
  return (
    <li>
      <fetcher.Form method="delete">
        <input type="hidden" name="id" value={props.id} />
        <span>{props.title}</span>
        <button type="submit">Delete</button>
      </fetcher.Form>
    </li>
  );
};

export default function Index() {
  const action = useActionData<ActionData>();
  const data = useLoaderData<LoaderData>();
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, [ref]);
  return (
    <div>
      <h1>{data.message}</h1>
      <p>
        Want to <Link to="/logout">log out</Link>?
      </p>
      {action?.error && <p style={{ color: "red" }}>{action.error}</p>}
      <Form method="post">
        <h2>Create new Recipe:</h2>
        <input ref={ref} name="title" type="text" placeholder="Get Milk" />
        <button type="submit">Create</button>
      </Form>
      <ul>
        {data.todos.map((todo) => (
          <RecipeComponent key={todo.id} {...todo} />
        ))}
      </ul>
    </div>
  );
}