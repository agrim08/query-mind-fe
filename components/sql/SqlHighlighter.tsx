"use client";

import { useCallback, useRef } from "react";

// Minimal SQL tokenizer for tokyo-night-style highlighting
function tokenize(sql: string): { type: string; text: string }[] {
  const tokens: { type: string; text: string }[] = [];
  let i = 0;
  const text = sql;

  const KEYWORDS = new Set([
    "SELECT", "FROM", "WHERE", "JOIN", "LEFT", "RIGHT", "INNER", "OUTER",
    "ON", "AND", "OR", "NOT", "IN", "EXISTS", "AS", "GROUP", "BY", "ORDER",
    "HAVING", "LIMIT", "OFFSET", "DISTINCT", "UNION", "ALL", "INSERT", "INTO",
    "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE", "INDEX", "DROP",
    "ALTER", "ADD", "COLUMN", "WITH", "CASE", "WHEN", "THEN", "ELSE", "END",
    "IS", "NULL", "BETWEEN", "LIKE", "ASC", "DESC", "RETURNING",
  ]);

  const FUNCTIONS = new Set([
    "COUNT", "SUM", "AVG", "MAX", "MIN", "COALESCE", "NULLIF", "CAST",
    "EXTRACT", "DATE_TRUNC", "NOW", "CURRENT_DATE", "LENGTH", "LOWER",
    "UPPER", "TRIM", "CONCAT", "ROUND", "FLOOR", "CEIL",
  ]);

  while (i < text.length) {
    // Whitespace
    if (/\s/.test(text[i])) {
      let ws = "";
      while (i < text.length && /\s/.test(text[i])) ws += text[i++];
      tokens.push({ type: "whitespace", text: ws });
      continue;
    }

    // Comments
    if (text.startsWith("--", i)) {
      let comment = "";
      while (i < text.length && text[i] !== "\n") comment += text[i++];
      tokens.push({ type: "comment", text: comment });
      continue;
    }

    // Strings
    if (text[i] === "'") {
      let str = "'";
      i++;
      while (i < text.length && text[i] !== "'") {
        str += text[i++];
      }
      str += "'";
      i++;
      tokens.push({ type: "string", text: str });
      continue;
    }

    // Numbers
    if (/\d/.test(text[i])) {
      let num = "";
      while (i < text.length && /[\d.]/.test(text[i])) num += text[i++];
      tokens.push({ type: "number", text: num });
      continue;
    }

    // Identifiers / keywords
    if (/[a-zA-Z_]/.test(text[i])) {
      let word = "";
      while (i < text.length && /[\w]/.test(text[i])) word += text[i++];
      const upper = word.toUpperCase();
      if (KEYWORDS.has(upper)) {
        tokens.push({ type: "keyword", text: word });
      } else if (FUNCTIONS.has(upper)) {
        tokens.push({ type: "function", text: word });
      } else {
        // Peek: if next non-space is '(', it's a function; else table/column
        const rest = text.slice(i).trimStart();
        tokens.push({ type: rest.startsWith("(") ? "function" : "identifier", text: word });
      }
      continue;
    }

    // Operators
    if (/[=<>!+\-*/,;().]/.test(text[i])) {
      tokens.push({ type: "operator", text: text[i] });
      i++;
      continue;
    }

    tokens.push({ type: "plain", text: text[i] });
    i++;
  }

  return tokens;
}

const TOKEN_COLORS: Record<string, string> = {
  keyword:    "#bb9af7",
  function:   "#7aa2f7",
  string:     "#9ece6a",
  number:     "#ff9e64",
  operator:   "#89ddff",
  comment:    "#565f89",
  identifier: "#e0af68",
  plain:      "#c0caf5",
  whitespace: "inherit",
};

interface SqlHighlighterProps {
  sql: string;
  streaming?: boolean;
}

export default function SqlHighlighter({ sql, streaming = false }: SqlHighlighterProps) {
  const tokens = tokenize(sql);

  return (
    <code className="sql-content" style={{ display: "block" }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: TOKEN_COLORS[t.type] ?? "inherit", fontStyle: t.type === "comment" ? "italic" : "normal" }}>
          {t.text}
        </span>
      ))}
      {streaming && <span className="cursor-blink" />}
    </code>
  );
}
