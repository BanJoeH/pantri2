/* eslint-disable no-var */
declare global {
  type Prettify<T> = {
    [K in keyof T]: T[K];
    // eslint-disable-next-line @typescript-eslint/ban-types
  } & {};
  var TURSO_DATABASE_URL: string | undefined;
  var TURSO_AUTH_TOKEN: string | undefined;
}

export {};
