/** Site-wide identity used by metadata, Open Graph, robots, sitemap and manifest. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://querymind.app").replace(/\/$/, "");
export const SITE_NAME = "QueryMind";
export const SITE_TITLE = "QueryMind — Your database, in plain English.";
export const SITE_DESCRIPTION =
  "Connect your Postgres database and ask questions in plain English. QueryMind finds the right tables, writes the SQL, checks it, and runs it read-only.";

/** Authenticated app routes: never indexed. */
export const PRIVATE_ROUTES = ["/dashboard", "/connections", "/history", "/design", "/billing", "/settings"];
