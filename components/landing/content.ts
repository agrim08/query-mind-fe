/**
 * Landing page copy and demo data.
 * Every claim here must stay true to the product (see .claude/rules/business-logic.md).
 * Demo rows are illustrative sample data, not customer data.
 */

export interface DemoTable {
  name: string;
  score: number;
  used: boolean;
}

export interface DemoQuery {
  question: string;
  tables: DemoTable[];
  sql: string;
  columns: string[];
  rows: string[][];
  ms: number;
}

export const DEMO_QUERIES: DemoQuery[] = [
  {
    question: "Who are our top customers by spend?",
    tables: [
      { name: "customers", score: 0.92, used: true },
      { name: "orders", score: 0.89, used: true },
      { name: "refunds", score: 0.41, used: false },
    ],
    sql: `SELECT "c"."name", SUM("o"."total") AS "spent"
FROM "customers" AS "c"
JOIN "orders" AS "o" ON "o"."customer_id" = "c"."id"
GROUP BY "c"."name"
ORDER BY "spent" DESC
LIMIT 4`,
    columns: ["name", "spent"],
    rows: [
      ["Acme Robotics", "$48,210"],
      ["Northwind Labs", "$41,980"],
      ["Brightline", "$37,455"],
      ["Kepler & Co", "$29,870"],
    ],
    ms: 84,
  },
  {
    question: "How many people signed up each week this month?",
    tables: [
      { name: "users", score: 0.94, used: true },
      { name: "sessions", score: 0.57, used: false },
      { name: "invites", score: 0.44, used: false },
    ],
    sql: `SELECT date_trunc('week', "created_at") AS "week",
       COUNT(*) AS "signups"
FROM "users"
WHERE "created_at" >= date_trunc('month', now())
GROUP BY "week"
ORDER BY "week"`,
    columns: ["week", "signups"],
    rows: [
      ["Sep 29", "312"],
      ["Oct 06", "358"],
      ["Oct 13", "401"],
      ["Oct 20", "447"],
    ],
    ms: 41,
  },
  {
    question: "Find all churned accounts in Europe.",
    tables: [
      { name: "accounts", score: 0.91, used: true },
      { name: "subscriptions", score: 0.88, used: true },
      { name: "invoices", score: 0.46, used: false },
    ],
    sql: `SELECT "a"."name", "a"."country", "s"."canceled_at"
FROM "accounts" AS "a"
JOIN "subscriptions" AS "s" ON "s"."account_id" = "a"."id"
WHERE "s"."status" = 'canceled' AND "a"."region" = 'EU'
ORDER BY "s"."canceled_at" DESC`,
    columns: ["name", "country", "canceled_at"],
    rows: [
      ["Lumen GmbH", "DE", "2025-10-18"],
      ["Atelier Nord", "FR", "2025-10-11"],
      ["Brava Studio", "ES", "2025-09-30"],
      ["Oakfield Ltd", "IE", "2025-09-22"],
    ],
    ms: 67,
  },
];

export interface ExampleQuestion {
  who: string;
  text: string;
  answer: string; // illustrative result preview
  ms: number;
}

export const QUESTIONS: ExampleQuestion[] = [
  { who: "Founder", text: "What is our total revenue this month?", answer: "$84,210", ms: 96 },
  { who: "Support", text: "Show tickets open longer than 3 days", answer: "38 tickets", ms: 142 },
  { who: "Product", text: "Which features do new users try first?", answer: "Exports · 41%", ms: 188 },
  { who: "Ops", text: "Orders stuck in processing since Monday", answer: "17 orders", ms: 64 },
  { who: "Marketing", text: "Signups by source, last 30 days", answer: "6 sources", ms: 79 },
  { who: "Customer success", text: "Find all churned accounts in Europe.", answer: "4 accounts", ms: 67 },
];

export const PROVIDERS = [
  "Neon",
  "Supabase",
  "Amazon RDS",
  "Google Cloud SQL",
  "Azure Database",
  "Railway",
  "Render",
  "Aiven",
  "Crunchy Bridge",
  "Your own server",
];

export interface Step {
  label: string;
  title: string;
  body: string;
}

export const STEPS: Step[] = [
  {
    label: "Map",
    title: "It learns your schema once.",
    body: "When you connect, QueryMind reads table names, columns, types and foreign keys, plus one example value per column, and indexes them for search. Your rows stay in your database.",
  },
  {
    label: "Find",
    title: "It finds the tables that matter.",
    body: "Your question is matched against that index. Only the most relevant tables go to the model, so it works from your real schema instead of guessing.",
  },
  {
    label: "Write",
    title: "It writes the SQL while you watch.",
    body: "The query streams in token by token. You always see exactly what will run before any result appears.",
  },
  {
    label: "Run",
    title: "It checks, then runs it read-only.",
    body: "One SELECT, known tables only, nothing that writes. Then it runs inside a read-only transaction with a 10-second limit and returns up to 500 rows.",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQS: Faq[] = [
  {
    q: "Can QueryMind change or delete my data?",
    a: "No. Every query is checked to be a single read-only SELECT before it runs, and then it runs inside a read-only transaction, so Postgres itself refuses any write. For extra peace of mind, connect with a read-only database user.",
  },
  {
    q: "What leaves my database?",
    a: "To build the search index: table and column names, types, foreign keys and one example value per column. When you ask a question: the question and the generated SQL. Result rows are shown to you and are not stored. Your history keeps the question, the SQL, the row count and the timing.",
  },
  {
    q: "How are my credentials stored?",
    a: "Your connection string is encrypted (Fernet: AES-128 with an HMAC-SHA256 signature) before it is saved. It is decrypted only while a query runs, and it is never sent to your browser or to the AI model.",
  },
  {
    q: "Which databases work?",
    a: "Any PostgreSQL database you can reach with a connection string: Neon, Supabase, Amazon RDS, Google Cloud SQL, Railway, Render, or your own server. It needs to accept connections from outside your network.",
  },
  {
    q: "What if the SQL is wrong?",
    a: "You see the SQL before the results, and it can only reference tables that exist in your schema. If your tables can't answer the question, QueryMind tells you so instead of making something up.",
  },
  {
    q: "What counts as a question?",
    a: "Each question you run counts once, including ones that end in an error. Requests that are stopped before they start, for example when you're over your monthly limit, don't count.",
  },
];
