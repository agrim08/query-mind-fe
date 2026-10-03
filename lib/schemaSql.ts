import type { DesignColumn, DesignTable } from "@/lib/api";

/**
 * Turns a Schema Designer canvas into runnable PostgreSQL.
 *
 * Edge contract (see backend `DBEdge`): `source` is the parent table (owns the
 * primary key) and `target` is the child table (holds the foreign key column).
 * If the model drew an edge the other way round but the FK column clearly lives
 * on the source table, we follow the column instead of the arrow.
 */

type EdgeLike = { source: string; target: string };

interface Relationship {
  parent: DesignTable;
  parentKey: DesignColumn;
  child: DesignTable;
  childColumn: string;
}

// Serial types are auto-incrementing PKs; the FK column must be the plain integer type.
const SERIAL_TO_INTEGER: Record<string, string> = {
  SMALLSERIAL: "SMALLINT",
  SERIAL2: "SMALLINT",
  SERIAL: "INTEGER",
  SERIAL4: "INTEGER",
  BIGSERIAL: "BIGINT",
  SERIAL8: "BIGINT",
};

const MAX_IDENTIFIER_LENGTH = 63; // PostgreSQL NAMEDATALEN - 1

function quoteIdent(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}

function singular(name: string): string {
  const lower = name.toLowerCase();
  if (lower.endsWith("ies")) return `${lower.slice(0, -3)}y`;
  if (lower.endsWith("sses") || lower.endsWith("xes")) return lower.slice(0, -2);
  if (lower.endsWith("s") && !lower.endsWith("ss")) return lower.slice(0, -1);
  return lower;
}

function foreignKeyType(primaryKeyType: string): string {
  const trimmed = primaryKeyType.trim();
  return SERIAL_TO_INTEGER[trimmed.toUpperCase()] ?? trimmed;
}

function primaryKeys(table: DesignTable): DesignColumn[] {
  return table.columns.filter((c) => c.isPrimary);
}

/** The column in `child` that references `parent`, if the design already has one. */
function findForeignKeyColumn(
  child: DesignTable,
  parent: DesignTable,
  parentKey: DesignColumn,
): DesignColumn | undefined {
  const parentNames = [singular(parent.name), parent.name.toLowerCase(), singular(parent.id)];
  const candidates = new Set(
    parentNames.flatMap((n) => [`${n}_${parentKey.name.toLowerCase()}`, `${n}_id`]),
  );
  return child.columns.find((c) => candidates.has(c.name.toLowerCase()));
}

function resolveRelationship(
  source: DesignTable,
  target: DesignTable,
): Relationship | string {
  const sourceKeys = primaryKeys(source);
  const targetKeys = primaryKeys(target);

  // Contract direction: source = parent, target = child.
  if (sourceKeys.length === 1) {
    const existing = findForeignKeyColumn(target, source, sourceKeys[0]);
    if (existing) {
      return { parent: source, parentKey: sourceKeys[0], child: target, childColumn: existing.name };
    }
  }
  // Reversed edge whose FK column clearly lives on the source table.
  if (targetKeys.length === 1) {
    const existing = findForeignKeyColumn(source, target, targetKeys[0]);
    if (existing) {
      return { parent: target, parentKey: targetKeys[0], child: source, childColumn: existing.name };
    }
  }
  // No FK column yet: follow the contract and create one on the child.
  if (sourceKeys.length === 1) {
    return {
      parent: source,
      parentKey: sourceKeys[0],
      child: target,
      childColumn: `${singular(source.name)}_${sourceKeys[0].name.toLowerCase()}`,
    };
  }
  return sourceKeys.length === 0
    ? `-- Skipped ${source.name} -> ${target.name}: ${quoteIdent(source.name)} has no primary key.`
    : `-- Skipped ${source.name} -> ${target.name}: composite primary keys need a hand-written foreign key.`;
}

function constraintName(child: string, column: string, used: Set<string>): string {
  const base = `fk_${child}_${column}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, MAX_IDENTIFIER_LENGTH);
  let name = base;
  for (let i = 2; used.has(name); i++) {
    const suffix = `_${i}`;
    name = `${base.slice(0, MAX_IDENTIFIER_LENGTH - suffix.length)}${suffix}`;
  }
  used.add(name);
  return name;
}

function renderTable(table: DesignTable, extraColumns: DesignColumn[]): string {
  const keys = primaryKeys(table);
  const composite = keys.length > 1;

  const lines = [...table.columns, ...extraColumns].map((col) => {
    let constraints = (col.constraints ?? "").trim();
    if (composite) constraints = constraints.replace(/\bPRIMARY\s+KEY\b/gi, "").trim();
    let line = `  ${quoteIdent(col.name)} ${col.type}`;
    if (col.isPrimary && !composite && !/\bPRIMARY\s+KEY\b/i.test(constraints)) {
      line += " PRIMARY KEY";
    }
    if (constraints) line += ` ${constraints}`;
    return line;
  });
  if (composite) {
    lines.push(`  PRIMARY KEY (${keys.map((k) => quoteIdent(k.name)).join(", ")})`);
  }
  return `CREATE TABLE ${quoteIdent(table.name)} (\n${lines.join(",\n")}\n);\n`;
}

export function exportToSQL(tables: DesignTable[], edges: EdgeLike[]): string {
  const byId = new Map(tables.map((t) => [t.id, t]));
  const extraColumns = new Map<string, DesignColumn[]>();
  const relationships: Relationship[] = [];
  const notes: string[] = [];
  const seen = new Set<string>();

  for (const edge of edges) {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target || source.id === target.id) continue;

    const resolved = resolveRelationship(source, target);
    if (typeof resolved === "string") {
      notes.push(resolved);
      continue;
    }
    const key = `${resolved.child.id}.${resolved.childColumn.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    relationships.push(resolved);

    const exists = resolved.child.columns.some(
      (c) => c.name.toLowerCase() === resolved.childColumn.toLowerCase(),
    );
    if (!exists) {
      const added = extraColumns.get(resolved.child.id) ?? [];
      added.push({
        name: resolved.childColumn,
        type: foreignKeyType(resolved.parentKey.type),
        isForeign: true,
      });
      extraColumns.set(resolved.child.id, added);
    }
  }

  let sql = "-- Generated by QueryMind DB Design AI\n\n";
  sql += tables.map((t) => renderTable(t, extraColumns.get(t.id) ?? [])).join("\n");

  if (relationships.length > 0 || notes.length > 0) {
    sql += "\n-- Foreign Keys\n";
    const usedNames = new Set<string>();
    for (const rel of relationships) {
      const name = constraintName(rel.child.name, rel.childColumn, usedNames);
      sql += `ALTER TABLE ${quoteIdent(rel.child.name)} ADD CONSTRAINT ${quoteIdent(name)}\n`;
      sql += `  FOREIGN KEY (${quoteIdent(rel.childColumn)}) REFERENCES ${quoteIdent(rel.parent.name)} (${quoteIdent(rel.parentKey.name)});\n\n`;
    }
    for (const note of notes) sql += `${note}\n`;
  }

  return sql;
}
