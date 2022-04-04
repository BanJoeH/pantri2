import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Link, useActionData } from "@remix-run/react";
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from "firebase/auth";
import React from "react";

import { checkSessionCookie, signIn, signInWithEmailOnly } from "~/server/auth.server";
import { auth } from "~/server/firebase.server";
import { commitSession, getSession } from "~/session";

export const loader: LoaderFunction = async ({ request }) => {

  if (isSignInWithEmailLink(auth.client, request.url)) {
    console.log("IS SIGN IN WITH EMAIL LINK")
    let email = new URL(request.url).searchParams.get("email");
    if (!email) {
        throw redirect("/login")
    }
    const result = await signInWithEmailLink(auth.client, email, request.url);
    const sessionCookie = await signInWithEmailOnly(result.user)
    const session = await getSession(request.headers.get("cookie"));

    session.set("session", sessionCookie);
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
}
  const session = await getSession(request.headers.get("cookie"));
  const { uid } = await checkSessionCookie(session);
  const headers = {
    "Set-Cookie": await commitSession(session),
  };
  if (uid) {
    return redirect("/", { headers });
  }
  return json(null, { headers });
};

type ActionData = {
  error?: string;
  email?: string;
};


export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email");
  const emailOnlySignIn = form.get("emailOnly");
  console.log(emailOnlySignIn)
  if (emailOnlySignIn) {
    if (typeof email !== "string") {
      return json({ error: "email is required" }, { status: 400 });
    }
    const actionCodeSettings = {
      url: request.url + "?email=" + email,
      handleCodeInApp: true,
    }
    await sendSignInLinkToEmail(auth.client, email, actionCodeSettings)
    return json({ email }, { status: 200 });
  }
  const password = form.get("password");
  const formError = json({ error: "Please fill all fields!" }, { status: 400 });
  if (typeof email !== "string") return formError;
  if (typeof password !== "string") return formError;
  try {
    const sessionCookie = await signIn(email, password);
    const session = await getSession(request.headers.get("cookie"));
    session.set("session", sessionCookie);
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error(error);
    return json<ActionData>({ error: String(error) }, { status: 401 });
  }
};

export default function Login() {
  const action = useActionData<ActionData>();

  React.useEffect(() => {
    if (action?.email) {
      localStorage.setItem('emailForSignIn', action.email);
    }
  }, [action?.email])
  
  return (
    <div>
      <h1>Login</h1>
      {action?.error && <p>{action.error}</p>}
      <form method="post" id="signIn">
        <input
          style={{ display: "block" }}
          name="email"
          placeholder="you@example.com"
          type="email"
          value="jch.harrison@gmail.com"
        />
        <label>
        <input
          type="checkbox"
          name="emailOnly"
          id="emailOnly"
            aria-label="Email only Sign in"
            value="true"
          />
          Sign in with email only
          </label>
        <input
          style={{ display: "block" }}
          name="password"
          placeholder="password"
          type="password"
        />
        <button style={{ display: "block" }} type="submit">
          Login
        </button>
      </form>
      {action?.email && <p>please click the link in your email to complete sign in</p>}
      <p>
        Do you want to <Link to="/signup">join</Link>?
      </p>
    </div>
  );
}