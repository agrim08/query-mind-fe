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

export async function syncUser(data: {
  clerk_id: string;
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
  pinecone_namespace: string | null;
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

export interface QueryStreamEvent {
  // Backend sends: status, sql_chunk, results, error, done
  type:
    | "sql_chunk"
    | "results"
    | "error"
    | "status"
    | "done"
    | "sql_done"
    | "meta";
  chunk?: string;
  sql?: string;
  // Rows arrive as list[list] from backend — we zip them in streamQuery
  rows?: Record<string, unknown>[];
  columns?: string[];
  row_count?: number;
  exec_time_ms?: number;
  message?: string;
}

export function streamQuery(
  data: { nl_query: string; connection_id: string },
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
  status: "success" | "error" | "pending" | string;
  error_message: string | null;
  row_count: number | null;
  exec_time_ms: number | null;
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
  // Backend returns a plain array (no total count yet)
  const items: HistoryEntry[] = await res.json();
  return {
    items,
    total:
      items.length < pageSize
        ? (page - 1) * pageSize + items.length
        : page * pageSize + 1,
  };
}
