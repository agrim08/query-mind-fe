import { readSse } from "./sse";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

let _getToken: (() => Promise<string | null>) | null = null;
let _tokenGetterSet: () => void = () => {};
// React runs a child's effects before its parent's, so a page can call the API before
// ApiTokenProvider (in AppShell) registers the getter. Calls wait for it instead of going out unsigned.
const _tokenGetterReady = new Promise<void>((resolve) => {
  _tokenGetterSet = resolve;
});

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
  _tokenGetterSet();
}

async function authHeaders(): Promise<HeadersInit> {
  if (!_getToken) await _tokenGetterReady;
  const token = _getToken ? await _getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Errors ─────────────────────────────────────────────────────────────────

/** Plan-limit codes the backend sends with HTTP 403 (business-logic.md §3). */
export type LimitCode = "QUERY_LIMIT_REACHED" | "CONNECTION_LIMIT_REACHED" | "DESIGN_LIMIT_REACHED";

const LIMIT_MESSAGES: Record<LimitCode, string> = {
  QUERY_LIMIT_REACHED: "You've used all your questions for this month.",
  CONNECTION_LIMIT_REACHED: "You've reached your plan's database limit.",
  DESIGN_LIMIT_REACHED: "You've used all your schema designs for this month.",
};

/** Every failed backend call throws this: a user-safe message, plus the limit code if it was one. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: LimitCode | null,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiError(res: Response, fallback: string): Promise<ApiError> {
  const body = await res.json().catch(() => ({}));
  const detail = typeof body.detail === "string" ? body.detail : null;
  if (detail && detail in LIMIT_MESSAGES) {
    const code = detail as LimitCode;
    return new ApiError(res.status, code, LIMIT_MESSAGES[code]);
  }
  return new ApiError(res.status, null, detail ?? fallback);
}

// ─── User ───────────────────────────────────────────────────────────────────

/** Profile fields only — the backend takes the user id from the verified Clerk token. */
export async function syncUser(data: {
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
}) {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/users/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await apiError(res, "We couldn't load your account. Please refresh.");
  return res.json();
}

// ─── Connections ─────────────────────────────────────────────────────────────

export interface Connection {
  id: string;
  name: string;
  table_count: number | null;
  indexed_at: string | null;
  is_active: boolean;
  created_at: string;
}

export async function getConnections(): Promise<Connection[]> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/connections/`, { headers });
  if (!res.ok) throw await apiError(res, "We couldn't load your connections. Please refresh.");
  return res.json();
}

export async function testConnection(
  conn_string: string,
): Promise<{ ok: boolean; error?: string }> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/connections/test`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ conn_string }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { ok: false, error: err.detail ?? "Connection failed" };
  }
  return res.json();
}

export async function createConnection(data: {
  name: string;
  connection_string: string;
}): Promise<Connection> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/connections/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw await apiError(res, "We couldn't save that connection. Please try again.");
  return res.json();
}

export async function deleteConnection(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/connections/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw await apiError(res, "We couldn't delete that connection. Please try again.");
}

export async function indexSchema(
  connectionId: string,
  onEvent: (event: {
    type: string;
    message?: string;
    current?: number;
    total?: number;
    table_count?: number;
  }) => void,
  signal?: AbortSignal,
): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/connections/${connectionId}/index`, { method: "POST", headers, signal });
  if (!res.ok) throw await apiError(res, "We couldn't start indexing. Please try again.");
  await readSse(res, (data) => onEvent(data as Parameters<typeof onEvent>[0]));
}

// ─── Query ───────────────────────────────────────────────────────────────────

/** The kind of question, as the model classified it (backend reply_format.Intent). */
export type AnswerIntent =
  | "number" | "trend" | "ranking" | "breakdown" | "comparison" | "list" | "record" | "schema" | "other";

/** How to draw a result (backend answer_presentation). Numbers are plain floats. */
export type AnswerChart =
  | { kind: "table" }
  | { kind: "record" }
  | { kind: "kpi"; items: { label: string; value: number; column: string }[] }
  | {
      kind: "line";
      x_label: string;
      labels: string[];
      series: ChartSeries[];
      /** False when the series are different measures: draw one panel each, never one axis. */
      shared_axis: boolean;
    }
  | {
      kind: "bar";
      label_column: string;
      labels: string[];
      /** One panel per measure; the first is the one the rows are ranked by. */
      series: ChartSeries[];
    };

export interface ChartSeries {
  name: string;
  values: (number | null)[];
}

export interface AnswerPresentation {
  intent: AnswerIntent;
  /** The question restated, e.g. "Top 5 customers by total spent". */
  understood: string | null;
  assumptions: string[];
  /** The same question with another reasonable reading, to run with one click. */
  alternatives: string[];
  follow_ups: string[];
  /** One sentence built from the data, e.g. "USA is highest with 13 (3 shown)." */
  headline: string;
  chart: AnswerChart;
}

export interface QueryStreamEvent {
  // Backend sends (query_pipeline.py): status, sql_chunk, retry, results, clarify, message,
  // error, done. "retry": the SQL so far failed and is being rewritten; discard it.
  type: "status" | "sql_chunk" | "retry" | "results" | "clarify" | "message" | "error" | "done";
  chunk?: string;
  /** results: the executed statement (the streamed SQL without any model metadata). */
  sql?: string;
  // Rows arrive as list[list] from backend — we zip them in streamQuery
  rows?: Record<string, unknown>[];
  columns?: string[];
  row_count?: number;
  exec_time_ms?: number;
  /** True when the query had more rows than the backend cap (500); only the first 500 are sent. */
  truncated?: boolean;
  answer?: AnswerPresentation;
  /** clarify: a multiple-choice question; send the choice back with `clarification`. */
  question?: string;
  options?: string[];
  question_id?: string;
  understood?: string | null;
  /** message: a plain answer about the database itself. */
  text?: string;
  message?: string;
  /** results: your own verified question this answer was based on, when one was close. */
  verified_match?: string | null;
  /** results: names of the business definitions given to the model. */
  knowledge_used?: string[];
  /** results: the SQL came from an earlier answer to exactly this question (no new AI call). */
  reused?: boolean;
}

export interface ClarificationAnswer {
  question_id: string;
  answer: string;
}

export async function streamQuery(
  data: {
    nl_query: string;
    connection_id: string;
    clarification?: ClarificationAnswer;
    /** The earlier question this one follows up (its `question_id`). */
    follow_up_of?: string;
    /** Ask the model again instead of reusing an earlier answer. */
    fresh?: boolean;
  },
  onEvent: (event: QueryStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/query/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(data),
    signal,
  });
  if (!res.ok) throw await apiError(res, "Something went wrong. Please try again.");
  await readSse(res, (raw) => {
    const event = raw as QueryStreamEvent;
    // The backend sends rows as lists; components read them by column name.
    if (event.type === "results" && Array.isArray(event.rows) && Array.isArray(event.columns)) {
      event.rows = rowsToRecords(event.columns, event.rows as unknown as unknown[][]);
    }
    onEvent(event);
  });
}

//  History ─────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  nl_query: string;
  /** Backend field name is generated_sql */
  generated_sql: string | null;
  connection_id: string;
  status: "success" | "error" | "validation_error" | "clarify" | "pending";
  error_message: string | null;
  row_count: number | null;
  exec_time_ms: number | null;
  /** The earlier question this one followed up on. */
  follow_up_of: string | null;
  created_at: string;
  /** This answer is saved as verified (👍). */
  verified: boolean;
  /** The model's restatement of the question. */
  understood: string | null;
  /** The statement that ran, without QueryMind's comment lines. */
  sql: string | null;
}

export async function getHistory(
  page = 1,
  pageSize = 20,
  connectionId?: string | null,
): Promise<{ items: HistoryEntry[]; total: number }> {
  const headers = await authHeaders();
  let url = `${BASE}/query/history?page=${page}&page_size=${pageSize}`;
  if (connectionId) {
    url += `&connection_id=${connectionId}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw await apiError(res, "We couldn't load your history. Please refresh.");
  return res.json();
}

// ─── Knowledge (business context, definitions, verified answers) ────────────

/** The backend sends rows as lists; components read them by column name. */
function rowsToRecords(columns: string[], rows: unknown[][]): Record<string, unknown>[] {
  return rows.map((row) => Object.fromEntries(columns.map((column, i) => [column, row[i]])));
}

/** One JSON request; a non-2xx response throws with the backend's user-safe `detail`. */
async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers, ...init.headers },
  });
  if (!res.ok) throw await apiError(res, "Something went wrong. Please try again.");
  return res.status === 204 ? (undefined as T) : res.json();
}

export type KnowledgeKind = "metric" | "term" | "filter" | "convention" | "table_note" | "clarification";

export interface KnowledgeItem {
  id: string;
  kind: KnowledgeKind;
  name: string;
  definition: string;
  /** ai = extracted at setup; user = written or edited by you; clarification = your earlier answer. */
  source: "ai" | "user" | "clarification";
  updated_at: string;
}

export interface VerifiedQuery {
  id: string;
  question: string;
  sql: string;
  created_at: string;
}

export interface Knowledge {
  description: string;
  starter_questions: string[];
  items: KnowledgeItem[];
  verified_queries: VerifiedQuery[];
  /** AI setup calls (draft / extract) left today for this connection. */
  setup_calls_left: number;
}

const knowledgePath = (connectionId: string) => `/connections/${connectionId}/knowledge`;

export const getKnowledge = (connectionId: string) => requestJson<Knowledge>(knowledgePath(connectionId));

export const saveDescription = (connectionId: string, description: string) =>
  requestJson<Knowledge>(`${knowledgePath(connectionId)}/description`, {
    method: "PUT",
    body: JSON.stringify({ description }),
  });

/** An AI-written starting description from the schema (not saved). Uses a setup call. */
export const draftDescription = (connectionId: string) =>
  requestJson<{ description: string }>(`${knowledgePath(connectionId)}/draft`, { method: "POST" });

/** Turn the saved description + schema into definitions and starter questions. Uses a setup call. */
export const extractKnowledge = (connectionId: string) =>
  requestJson<Knowledge>(`${knowledgePath(connectionId)}/extract`, { method: "POST" });

export const addKnowledgeItem = (
  connectionId: string,
  item: { kind: KnowledgeKind; name: string; definition: string },
) => requestJson<KnowledgeItem>(`${knowledgePath(connectionId)}/items`, { method: "POST", body: JSON.stringify(item) });

export const updateKnowledgeItem = (
  connectionId: string,
  itemId: string,
  changes: Partial<{ kind: KnowledgeKind; name: string; definition: string }>,
) =>
  requestJson<KnowledgeItem>(`${knowledgePath(connectionId)}/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(changes),
  });

export const deleteKnowledgeItem = (connectionId: string, itemId: string) =>
  requestJson<void>(`${knowledgePath(connectionId)}/items/${itemId}`, { method: "DELETE" });

export const deleteVerifiedQuery = (connectionId: string, verifiedId: string) =>
  requestJson<void>(`${knowledgePath(connectionId)}/verified/${verifiedId}`, { method: "DELETE" });

/** 👍: save an answered question and its SQL as verified for this connection. */
export const verifyAnswer = (questionId: string) =>
  requestJson<VerifiedQuery>(`/query/${questionId}/verify`, { method: "POST" });

/** The answer saved when a question was asked (mirrors AnswerSnapshotResponse). */
export interface SavedAnswer {
  answer: AnswerPresentation;
  columns: string[];
  /** The first rows (up to 50) of what the query returned. */
  rows: Record<string, unknown>[];
  /** Rows the query returned when it ran. */
  row_count: number;
  /** The query had more rows than the 500-row cap. */
  truncated: boolean;
}

export async function getSavedAnswer(questionId: string): Promise<SavedAnswer> {
  const saved = await requestJson<Omit<SavedAnswer, "rows"> & { rows: unknown[][] }>(`/query/${questionId}/answer`);
  return { ...saved, rows: rowsToRecords(saved.columns, saved.rows) };
}

// ─── Design ─────────────────────────────────────────────────────────────────

// Mirrors backend app/schemas/design.py. Edges go source = parent (PK) -> target = child (FK).
export type DesignColumn = {
  name: string;
  type: string;
  constraints?: string | null;
  isPrimary?: boolean;
  isForeign?: boolean;
};

export type DesignTable = {
  id: string;
  name: string;
  columns: DesignColumn[];
};

export type DesignEdge = {
  id: string;
  source: string;
  target: string;
  label?: string | null;
};

export type DBSchemaDesign = {
  tables: DesignTable[];
  edges: DesignEdge[];
};

export interface DesignHistoryEntry {
  id: string;
  prompt: string;
  schema_json: DBSchemaDesign;
  created_at: string;
}

export async function generateSchema(prompt: string): Promise<DBSchemaDesign> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/design/generate-schema`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw await apiError(res, "We couldn't design that schema. Please try again.");
  return res.json();
}

export async function getDesignHistory(): Promise<DesignHistoryEntry[]> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/design/history`, { headers });
  if (!res.ok) throw await apiError(res, "We couldn't load your designs. Please refresh.");
  return res.json();
}

// ─── Usage (mirrors UsageResponse: the shape every metered feature exposes) ─────

export interface Usage {
  used: number;
  limit: number;
  unlimited: boolean;
}

/** Questions asked this calendar month (UTC) and the plan's limit. */
export const getQuestionUsage = () => requestJson<Usage>("/query/usage");

/** Schema designs this calendar month (UTC) and the plan's limit. */
export const getDesignUsage = () => requestJson<Usage>("/design/usage");
