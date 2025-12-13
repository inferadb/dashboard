import {
  Outlet,
  ScrollRestoration,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { NotFoundComponent } from "./_404";
import { RouteErrorComponent } from "@/components/error-boundary";
import "@/styles.css";

export const Route = createRootRoute({
  notFoundComponent: NotFoundComponent,
  errorComponent: RouteErrorComponent,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "InferaDB" },
      { name: "description", content: "Authorization management console" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background font-sans">
        {children}
        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
