import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
import {
  // Form,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from "@remix-run/react";
import { CircleUser, Menu, Package2, Search } from "lucide-react";
import { Button } from "../@/components/ui/button";
import { Input } from "../@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "../@/components/ui/sheet";
import "./globals.css";
import { Auth } from "./lib.server/auth";

export async function loader(args: LoaderFunctionArgs) {
  const auth = new Auth(args.context);
  const isLoggedIn = await auth.isAuthenticated(args.request, {});
  console.log({ isLoggedIn });
  const status = isLoggedIn
    ? isLoggedIn.authenticated
      ? ("registeredUser" as const)
      : ("anonymousUser" as const)
    : ("notLoggedIn" as const);
  // console.log({ isLoggedIn });
  return {
    status,
  };
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function Header() {
  const data = useRouteLoaderData<typeof loader>("root");
  console.log({ data });

  return (
    // <header className="">
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 whitespace-nowrap">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          to="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <span className="">Joes Pantry</span>
        </Link>
        <Link
          to="#"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Home
        </Link>
        <Link
          to="#"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          Recipe Books
        </Link>
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              to="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <span className="">Joes Pantry</span>
            </Link>
            <Link
              to="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Home
            </Link>
            <Link
              to="#"
              className="text-muted-foreground hover:text-foreground"
            >
              Recipe Books
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="rounded-full">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
    // </header>
  );
  {
    /* <Link to="/" className="text-blue-500">
    Home
  </Link>
  <Link to="/recipes" className="text-blue-500">
    Recipes
  </Link>
  {data?.status === "anonymousUser" ? (
    <Link to="/claim-account">Claim Account</Link>
  ) : null}
  {data?.status === "notLoggedIn" ? (
    <Link to="/login">Login</Link>
  ) : (
    <Form method="POST" action="/logout">
      <button type="submit">Logout</button>
    </Form>
  )} */
  }
}
