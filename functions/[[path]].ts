import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";
import { getLoadContext } from "../load-context";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment, @typescript-eslint/prefer-ts-expect-error
// @ts-ignore - the server build file is generated by `remix vite:build`
// eslint-disable-next-line import/no-unresolved
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext,
});
