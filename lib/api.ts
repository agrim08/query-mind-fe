const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = _getToken ? await _getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  if (!res.ok) throw new Error("Failed to sync user");
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
  if (!res.ok) throw new Error("Failed to fetch connections");
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to create connection");
  }
  return res.json();
}

export async function deleteConnection(id: string): Promise<void> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/connections/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete connection");
}

export function indexSchema(
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
  return new Promise(async (resolve, reject) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/connections/${connectionId}/index`, {
        method: "POST",
        headers,
        signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return reject(new Error(err.detail ?? "Failed to index schema"));
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const parsed = JSON.parse(line.slice(6));
              onEvent(parsed);
            } catch {}
          }
        }
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  });
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
}

export interface ClarificationAnswer {
  question_id: string;
  answer: string;
}

export function streamQuery(
  data: {
    nl_query: string;
    connection_id: string;
    clarification?: ClarificationAnswer;
    /** The earlier question this one follows up (its `question_id`). */
    follow_up_of?: string;
  },
  onEvent: (event: QueryStreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const headers = await authHeaders();
      const res = await fetch(`${BASE}/query/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(data),
        signal,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return reject(new Error(err.detail ?? "Query failed"));
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const raw = JSON.parse(line.slice(6));
              // Backend returns rows as list[list] — zip with columns into Record objects
              if (
                raw.type === "results" &&
                Array.isArray(raw.rows) &&
                Array.isArray(raw.columns)
              ) {
                raw.rows = (raw.rows as unknown[][]).map((row: unknown[]) => {
                  const obj: Record<string, unknown> = {};
                  (raw.columns as string[]).forEach(
                    (col: string, i: number) => {
                      obj[col] = row[i];
                    },
                  );
                  return obj;
                });
              }
              onEvent(raw);
            } catch {}
          }
        }
      }
      resolve();
    } catch (err) {
      reject(err);
    }
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
  if (!res.ok) throw new Error("Failed to fetch history");
  return res.json();
}

// ─── Knowledge (business context, definitions, verified answers) ────────────

/** One JSON request; a non-2xx response throws with the backend's user-safe `detail`. */
async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...headers, ...init.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === "string" ? err.detail : "Something went wrong. Please try again.");
  }
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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail ?? "Failed to generate schema");
  }
  return res.json();
}

export async function getDesignHistory(): Promise<DesignHistoryEntry[]> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/design/history`, { headers });
  if (!res.ok) throw new Error("Failed to fetch design history");
  return res.json();
}
