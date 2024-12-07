import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import { getDb } from "../../drizzle/db";
import { getUser } from "../users.server";
import { eq, sql } from "drizzle-orm";

export const meta: MetaFunction = () => {
  return [
    { title: "Joes Pantry" },
    {
      name: "description",
      content: "Joes Pantry - A Recipe Manager",
    },
  ];
};

export async function loader(args: LoaderFunctionArgs) {
  const db = getDb(args.context);
  const users = await getUser(db, eq(sql`1`, 1));
  return users;
}

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  return (
    <div className="font-sans p-4">
      <ul>
        {loaderData.map((user) => (
          <li key={user.id}>
            [{user.id}] - {user.name} - {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
