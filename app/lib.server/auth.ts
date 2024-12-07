// app/services/auth.server.ts
import type { AppLoadContext, SessionStorage } from "@remix-run/cloudflare";
import { Authenticator, Strategy, type AuthenticateOptions } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/lib.server/session";
import { getDb } from "../../drizzle/db";
import {
  attemptLogin,
  claimAccount,
  createAnonymousUser,
  createUser,
  getUserByExternalId,
} from "../users.server";
import { eq } from "drizzle-orm";

// Create an instance of the authenticator, pass a generic with what
// strategies will return and will store in the session

type Base = NonNullable<Awaited<ReturnType<typeof attemptLogin>>>;

type User = Prettify<
  Omit<Base, "email"> & { email: string; authenticated: true }
>;

type AnonymousUser = Base & { authenticated: false };

// export const authenticator = new Authenticator<User>(sessionStorage);

// authenticator.use(
//   new FormStrategy(async ({ form, context }) => {
//     if (!context) throw new Error("No context");
//     const db = getDb(context);
//     const email = String(form.get("email"));
//     const password = String(form.get("password"));
//     const user = await attemptLogin(db, email, password);
//     if (!user) throw new Error("Invalid credentials");
//     console.log(user);
//     return user;
//   }),
// );

export interface FormStrategyVerifyParams {
  /**
   * A FormData object with the content of the form used to trigger the
   * authentication.
   *
   * Here you can read any input value using the FormData API.
   */
  form: FormData | null;
  /**
   * An object of arbitrary for route loaders and actions provided by the
   * server's `getLoadContext()` function.
   */
  context?: AppLoadContext;
  /**
   * The request that triggered the authentication.
   */
  request: Request;
  json?: { password: string; email: string };
}

class CustomStrategy<User> extends Strategy<User, FormStrategyVerifyParams> {
  name = "formOrNull";
  async authenticate(
    request: Request,
    sessionStorage: SessionStorage,
    options: AuthenticateOptions & {
      json?: { password: string; email: string };
    },
  ) {
    const form = await this.readFormData(request, options);
    try {
      const user = await this.verify({
        form,
        context: options.context,
        request,
        json: options.json,
      });
      return this.success(user, request, sessionStorage, options);
    } catch (error) {
      if (error instanceof Error) {
        return await this.failure(
          error.message,
          request,
          sessionStorage,
          options,
          error,
        );
      }
      if (typeof error === "string") {
        return await this.failure(
          error,
          request,
          sessionStorage,
          options,
          new Error(error),
        );
      }
      return await this.failure(
        "Unknown error",
        request,
        sessionStorage,
        options,
        new Error(JSON.stringify(error, null, 2)),
      );
    }
  }
  async readFormData(request: Request, options: AuthenticateOptions) {
    try {
      if (options.context?.formData instanceof FormData) {
        return options.context.formData;
      }
      return await request.formData();
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export class Auth {
  protected authenticator: Authenticator<User | AnonymousUser>;
  protected sessionStorage: SessionStorage;

  public authenticate: Authenticator<User | AnonymousUser>["authenticate"];

  public isAuthenticated: Authenticator<
    User | AnonymousUser
  >["isAuthenticated"];

  public logout: Authenticator<User | AnonymousUser>["logout"];

  protected db: ReturnType<typeof getDb>;

  constructor(context: AppLoadContext) {
    this.sessionStorage = sessionStorage;

    this.authenticator = new Authenticator<User | AnonymousUser>(
      this.sessionStorage,
      {
        throwOnError: true,
        sessionKey: "token",
      },
    );

    const db = getDb(context);
    this.db = db;

    this.authenticator.use(
      new FormStrategy(async ({ form }) => {
        const email = String(form.get("email"));
        const password = String(form.get("password"));
        const user = await attemptLogin(db, email, password);
        if (!user) throw new Error("Invalid credentials");
        // safe to cast here as we authenticated using email which is what ts is
        // complaining about
        return { ...user, authenticated: true } as User;
      }),
    );
    this.authenticator.use(
      new CustomStrategy(async ({ form, json }) => {
        if (json) {
          const { email, password } = json;
          const user = await attemptLogin(db, email, password);
          if (!user) throw new Error("Invalid credentials");
          // safe to cast here as we authenticated using email which is what ts is
          // complaining about
          return { ...user, authenticated: true } as User;
        }
        if (!form) {
          // create an anonymous user
          const [user] = await createAnonymousUser(db);
          return { ...user, authenticated: false } as AnonymousUser;
        }
        const email = String(form.get("email"));
        const password = String(form.get("password"));
        const user = await attemptLogin(db, email, password);
        if (!user) throw new Error("Invalid credentials");
        // safe to cast here as we authenticated using email which is what ts is
        // complaining about
        return { ...user, authenticated: true } as User;
      }),
    );

    this.authenticate = this.authenticator.authenticate.bind(
      this.authenticator,
    );
    this.isAuthenticated = this.authenticator.isAuthenticated.bind(
      this.authenticator,
    );
    this.logout = this.authenticator.logout.bind(this.authenticator);
  }

  public async clear(request: Request) {
    const session = await this.sessionStorage.getSession(
      request.headers.get("cookie"),
    );
    return this.sessionStorage.destroySession(session);
  }

  public claimAccount = async (
    externalId: string,
    email: string,
    name: string,
    password: string,
  ) => {
    const db = this.db;
    const [currentUser] = await getUserByExternalId(db, externalId);
    if (!currentUser) throw new Error("Invalid externalId");
    if (currentUser.email) throw new Error("Account already claimed");
    await claimAccount(db, { name, email, password, externalId });

    return { success: true };
  };
}
