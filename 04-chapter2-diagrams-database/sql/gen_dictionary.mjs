// สร้างข้อมูลสำหรับหัวข้อ 2.12 (CRUD), 2.19-2.21 จากฐานข้อมูลตัวอย่างและ query ใน Use Case Description
// ใช้: cd 04-chapter2-diagrams-database && npm run dict
// ผลลัพธ์: dictionary.json (data dictionary + ตัวอย่างข้อมูล), queries.json (query แยกตาราง/คอลัมน์ที่แก้), crud.json

import { readFileSync, writeFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const at = (p) => new URL(p, import.meta.url);
const CONTENT = "../../01418321-final-project/report-doc/content/";
const UCS = JSON.parse(readFileSync(at(CONTENT + "usecases.json"), "utf8"));
// คำอธิบายตารางและ attribute
const DESC = JSON.parse(readFileSync(at(CONTENT + "tables.json"), "utf8"));

const db = new PGlite();
await db.exec(readFileSync(at("schema.sql"), "utf8"));
await db.exec(readFileSync(at("seed.sql"), "utf8"));

const TYPE = (t) => t.replace("character varying", "VARCHAR").replace("timestamp with time zone", "TIMESTAMPTZ")
  .replace("character", "CHAR").replace("numeric", "NUMERIC").replace("integer", "INTEGER").replace("smallint", "SMALLINT")
  .replace("boolean", "BOOLEAN").replace("date", "DATE");

const fmt = (v) => (v === null || v === undefined ? "NULL" : v instanceof Date ? v.toISOString().replace("T", " ").slice(0, 16) : String(v));

const tables = (await db.query(`SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.oid`)).rows.map((r) => r.relname);

const dictionary = [];
for (const t of tables) {
  const cols = (await db.query(`SELECT a.attnum, a.attname, format_type(a.atttypid, a.atttypmod) AS type, a.attnotnull,
      pg_get_expr(d.adbin, d.adrelid) AS def
    FROM pg_attribute a LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE a.attrelid = $1::regclass AND a.attnum > 0 AND NOT a.attisdropped ORDER BY a.attnum`, [t])).rows;
  const cons = (await db.query(`SELECT contype, conkey, pg_get_constraintdef(oid) AS def, confrelid::regclass::text AS ref
    FROM pg_constraint WHERE conrelid = $1::regclass`, [t])).rows;
  const columns = cols.map((c, i) => {
    const mine = cons.filter((k) => k.conkey.includes(c.attnum));
    const keys = [];
    if (mine.some((k) => k.contype === "p")) keys.push("PK");
    for (const k of mine.filter((k) => k.contype === "f")) keys.push(`FK → ${k.ref}`);
    const notes = [];
    for (const k of mine.filter((k) => k.contype === "c"))
      notes.push(k.def.replace(/^CHECK \(\((.*)\)\)$/, "$1").replace(/^CHECK \((.*)\)$/, "$1")
        .replace(/::text|::character varying|::numeric|\(ARRAY\[|\]\)/g, "").replace(/ = ANY /, " IN "));
    if (mine.some((k) => k.contype === "u" && k.conkey.length === 1)) notes.push("ห้ามซ้ำ (UNIQUE)");
    if (c.def?.startsWith("nextval") && !c.def.includes("||")) notes.push("รันเลขอัตโนมัติ");
    else if (c.def) notes.push(`ค่าเริ่มต้น ${c.def.replace(/::[\w ]+/g, "")}`);
    return { no: i + 1, name: c.attname, desc: DESC[t]?.cols[c.attname] ?? "", type: TYPE(c.type), key: keys.join(", "),
             notnull: c.attnotnull ? "Not Null" : "", range: notes.join("; ") };
  });
  const sample = await db.query(`SELECT * FROM ${t} LIMIT 5`);
  dictionary.push({ table: t, title: DESC[t]?.title ?? t, columns,
    sample: { fields: sample.fields.map((f) => f.name), rows: sample.rows.map((r) => sample.fields.map((f) => fmt(r[f.name]))) } });
}

// query: แยกประเภท ตารางที่ใช้ และคอลัมน์ที่ UPDATE
const queries = [];
for (const uc of UCS) {
  for (const m of uc.steps.flat().join("\n").matchAll(/\*\*(Q\w+\.\d+):\*\*\s*`([^`]+)`/g)) {
    const sql = m[2];
    const kind = (sql.match(/^(SELECT|INSERT|UPDATE|DELETE)\b/) ?? [null, "FORMULA"])[1];
    const used = [...sql.matchAll(/\b(?:FROM|JOIN|INTO|UPDATE)\s+(\w+)/g)].map((x) => x[1]).filter((x) => tables.includes(x));
    const set = kind === "UPDATE" ? [...sql.replace(/ WHERE .*/, "").matchAll(/(\w+)\s*=/g)].map((x) => x[1]) : [];
    queries.push({ id: m[1], uc: uc.id, uc_name: uc.name, sql, kind, tables: [...new Set(used)], set });
  }
}

// CRUD: Use Case x ตาราง จาก query
const LETTER = { INSERT: "C", SELECT: "R", UPDATE: "U", DELETE: "D" };
const crud = {};
for (const q of queries) {
  if (!LETTER[q.kind]) continue;
  crud[q.uc] ??= { name: q.uc_name, cells: {} };
  q.tables.forEach((t, i) => {
    const l = q.kind === "SELECT" || i === 0 ? LETTER[q.kind] : "R";
    const cell = new Set(crud[q.uc].cells[t] ?? "");
    cell.add(l);
    crud[q.uc].cells[t] = "CRUD".split("").filter((x) => cell.has(x)).join("");
  });
}

writeFileSync(at("dictionary.json"), JSON.stringify(dictionary, null, 2));
writeFileSync(at("queries.json"), JSON.stringify(queries, null, 2));
writeFileSync(at("crud.json"), JSON.stringify({ tables, crud }, null, 2));
const missing = dictionary.flatMap((d) => d.columns.filter((c) => !c.desc).map((c) => `${d.table}.${c.name}`));
console.log(`${dictionary.length} tables, ${queries.length} queries, ${Object.keys(crud).length} use cases`);
if (missing.length) { console.log("ไม่มีคำอธิบาย:", missing.join(", ")); process.exit(1); }
