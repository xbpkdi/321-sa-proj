// รัน query ทุกข้อใน Use Case Description บนฐานข้อมูลตัวอย่าง (PostgreSQL ผ่าน PGlite)
// ใช้: cd 04-chapter2-diagrams-database && npm i && npm run sql
// ผลลัพธ์เขียนไว้ที่ sql-results.json ให้ build_report.py ใช้ทำหัวข้อ 2.25
// แต่ละข้อรันใน transaction แยกแล้ว ROLLBACK ทุกข้อเริ่มจากข้อมูลตั้งต้นเหมือนกัน

import { readFileSync, writeFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

// ทดสอบบางส่วน: UC_JSON=<ไฟล์ UC เดี่ยวหรือ array> CASES_JSON=<ไฟล์ cases> NO_WRITE=1 npm run sql
const load = (p, base) => JSON.parse(readFileSync(p ? p : new URL(base, import.meta.url), "utf8"));
const UCS = [load(process.env.UC_JSON, "../../report-doc/content/usecases.json")].flat();

const queries = [];
for (const uc of UCS)
  for (const m of uc.steps.flat().join("\n").matchAll(/\*\*(Q\w+\.\d+):\*\*\s*`([^`]+)`/g))
    queries.push({ id: m[1], uc: uc.id, uc_name: uc.name, sql: m[2] });

// cases.json: { "Q1A.1": { params, setup?, check?, formula? } }
// formula = SELECT ที่คำนวณแทนสูตร (ข้อที่ไม่ใช่ SQL)
const CASES = load(process.env.CASES_JSON, "cases.json");
const FORMULA = Object.fromEntries(Object.entries(CASES).filter(([, c]) => c.formula).map(([k, c]) => [k, c.formula]));

const fmt = (v) => (v === null || v === undefined ? "NULL" : v instanceof Date ? v.toISOString().replace("T", " ").slice(0, 16) : Array.isArray(v) ? `{${v.join(",")}}` : String(v));
const table = (res) => ({ fields: res.fields.map((f) => f.name), rows: res.rows.slice(0, 8).map((r) => res.fields.map((f) => fmt(r[f.name]))), total: res.rows.length });

const db = new PGlite();
await db.exec(readFileSync(new URL("schema.sql", import.meta.url), "utf8"));
await db.exec(readFileSync(new URL("seed.sql", import.meta.url), "utf8"));

const out = [];
let failed = 0;
for (const q of queries) {
  const c = CASES[q.id] ?? {};
  const sql = FORMULA[q.id] ?? q.sql;
  const item = { id: q.id, uc: q.uc, uc_name: q.uc_name, sql: q.sql, run_sql: FORMULA[q.id] ? sql : null, params: (c.params ?? []).map(fmt) };
  await db.exec("BEGIN");
  try {
    if (c.setup) await db.exec(c.setup);
    const res = await db.query(sql, FORMULA[q.id] ? [] : c.params ?? []);
    item.affected = res.affectedRows ?? 0;
    if (res.fields.length) item.result = table(res);
    if (c.check) item.check = { sql: c.check, ...table(await db.query(c.check)) };
  } catch (e) {
    item.error = e.message; failed++;
  }
  await db.exec("ROLLBACK");
  out.push(item);
  console.log(item.error ? "FAIL" : "ok  ", q.id, item.error ?? (item.result ? `${item.result.total} rows` : `${item.affected} affected`));
}

if (!process.env.NO_WRITE) writeFileSync(new URL("sql-results.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`${out.length} queries, ${failed} failed`);
process.exit(failed ? 1 : 0);
