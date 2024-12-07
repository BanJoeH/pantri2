import { createClient, type Client } from "@libsql/client";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { sql, type SQL } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import type {
  SelectResultField,
  SelectResultFields,
} from "drizzle-orm/query-builders/select.types";
import type { SelectedFields, SQLiteColumn } from "drizzle-orm/sqlite-core";

export const getClient = ({
  url,
  authToken,
}: {
  url: string;
  authToken: string;
}) => {
  return createClient({
    url: url,
    authToken: authToken,
  });
};

export const getDbWithClient = ({ client }: { client: Client }) => {
  return drizzle(client, { logger: false });
};

export const getDb = (ctx: LoaderFunctionArgs["context"]) => {
  return getDbWithClient({
    client: getClient({
      url: ctx.cloudflare.env.TURSO_DATABASE_URL,
      authToken: ctx.cloudflare.env.TURSO_AUTH_TOKEN,
    }),
  });
};

export function jsonObject<T extends SelectedFields>(shape: T) {
  const chunks: SQL[] = [];

  Object.entries(shape).forEach(([key, value]) => {
    if (chunks.length > 0) {
      chunks.push(sql.raw(`,`));
    }

    chunks.push(sql.raw(`'${key}',`));

    chunks.push(sql`${value}`);
  });

  return sql<SelectResultFields<T>>`
    COALESCE(
      JSON_OBJECT(${sql.join(chunks)}),
      ${sql`JSON_OBJECT()`}
    )
  `;
}

export function jsonAgg<Column extends SelectedFields[string]>(column: Column) {
  return coalesce<SelectResultField<Column>[]>(
    sql`JSON_GROUP_ARRAY(${sql`${column}`})`,
    sql`JSON_ARRAY()`,
  );
}

export function jsonAggObject<T extends SelectedFields>(shape: T) {
  return sql<SelectResultFields<T>[]>`
    COALESCE(
      JSON_GROUP_ARRAY(${jsonObject(shape)}),
      ${sql`JSON_ARRAY()`}
    )
  `.mapWith({
    mapFromDriverValue: (value) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      JSON.parse(value) as SelectResultFields<T>[],
  });
}

export function jsonAggObj<
  T extends SelectedFields,
  Column extends SQLiteColumn,
>(Column: Column, shape: T) {
  return sql<SelectResultFields<T>[]>`
    CASE
      WHEN COUNT(${Column}) = 0 THEN ${sql`JSON_ARRAY()`}
      ELSE JSON_GROUP_ARRAY(${jsonObject(shape)})
    END
  `.mapWith({
    mapFromDriverValue: (value) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      JSON.parse(value) as SelectResultFields<T>[],
  });
}

export function coalesce<T>(value: SQL.Aliased<T> | SQL<T>, defaultValue: SQL) {
  return sql<T>`
    COALESCE(
      ${value},
      ${defaultValue}
    )
  `;
}
