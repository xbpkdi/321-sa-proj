// รัน query ทุกข้อใน Use Case Description บนฐานข้อมูลตัวอย่าง (PostgreSQL ผ่าน PGlite)
// ใช้: cd 04-chapter2-diagrams-database && npm i && npm run sql
// ผลลัพธ์เขียนไว้ที่ sql-results.json ให้ build_report.py ใช้ทำหัวข้อ 2.25
// แต่ละข้อรันใน transaction แยกแล้ว ROLLBACK ทุกข้อเริ่มจากข้อมูลตั้งต้นเหมือนกัน

import { readFileSync, writeFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const UCS = JSON.parse(readFileSync(new URL("../../01418321-final-project/report/content/usecases.json", import.meta.url), "utf8"));

const queries = [];
for (const uc of UCS)
  for (const m of uc.steps.flat().join("\n").matchAll(/\*\*(Q\w+\.\d+):\*\*\s*`([^`]+)`/g))
    queries.push({ id: m[1], uc: uc.id, uc_name: uc.name, sql: m[2] });

// สูตร (ไม่ใช่ SQL) — ทดสอบด้วย SELECT ที่คำนวณตามสูตรเดียวกัน
const FORMULA = {
  "Q4S.2": "SELECT sku, ROUND(((purchase_price * exchange_rate) + intl_freight + duty_fee) / order_qty + marketplace_fee + domestic_shipping + rsl_charge, 2) AS unit_cost FROM product_cost WHERE sku = 'FSH-MLR-240'",
  "Q5A.3": "SELECT p.sku, p.selling_price, c.unit_cost, p.selling_price - c.unit_cost AS expected_margin FROM products p JOIN cost_calculation_log c ON c.sku = p.sku WHERE c.cost_id = 5",
  "Q7S.4": "SELECT sku, in_house_qty, rsl_qty, in_house_qty + COALESCE(rsl_qty, 0) AS available_qty FROM stock WHERE sku = 'FSH-MLR-240'",
};

const ORDER_COLS = "SELECT order_id, order_status";
const CASES = {
  "Q1A.1": { params: ["admin@colorado.jp"] },
  "Q1A.2": { params: ["staff01@colorado.jp"], check: "SELECT user_email, fail_attempts FROM users WHERE user_email = 'staff01@colorado.jp'" },
  "Q1A.3": { params: ["admin@colorado.jp"], check: "SELECT user_email, fail_attempts, last_login FROM users WHERE user_email = 'admin@colorado.jp'" },
  "Q2A.1": { params: [] },
  "Q2A.2": { params: ["ORD-24190"] },
  "Q2A.3": { params: ["ORD-24190"] },
  "Q2A.4": { params: ["U001", "ORD-24190"], check: `${ORDER_COLS}, verified_at, verified_by FROM orders WHERE order_id = 'ORD-24190'` },
  "Q3A.1": { params: ["FSH-MLR-240"] },
  "Q3A.2": { params: ["FSH-TRL-090", "เหยื่อยางหนอน 9 ซม.", "สีส้มเรืองแสง", "Rakuten Ichiba", "SUP-01", 30, 150, 680],
             check: "SELECT sku, product_name, supplier_id, reorder_threshold, reorder_qty, selling_price FROM products WHERE sku = 'FSH-TRL-090'" },
  "Q3A.3": { params: ["เหยื่อปลอมมินโนว์ จมช้า 24 กรัม", "สีเงินลายปลาซิว", "SUP-01", 50, 240, 1290, "FSH-MLR-240"],
             check: "SELECT sku, reorder_threshold, reorder_qty, selling_price FROM products WHERE sku = 'FSH-MLR-240'" },
  "Q3A.4": { params: ["rk-mlr240-sv-b", "Rakuten Ichiba", "FSH-MLR-240", "สีเงินลายปลาซิว", "เหยื่อปลอมมินโนว์ จมช้า 24 กรัม"],
             check: "SELECT sku_rule_id, channel_sku, sku FROM sku_rules WHERE channel_sku = 'rk-mlr240-sv-b'" },
  "Q4A.1": { params: ["377841-20261005-0000190", "Rakuten Ichiba"] },
  "Q4A.2": { params: ["377841-20261005-0000191", "Rakuten Ichiba", "2026-10-05 10:02:00+09", "rk-ydm012-3", "YDM-HRB-012", "แพ็ค 3 หลอด", 3, "100-0005 東京都千代田区丸の内 1-9-1", "RSL ปกติ"],
             check: `${ORDER_COLS}, marketplace_order_id, sku, qty FROM orders WHERE marketplace_order_id = '377841-20261005-0000191'` },
  "Q5A.1": { params: ["ORD-24184"] },
  "Q5A.2": { params: ["FSH-RDS-180"] },
  "Q5A.4": { params: ["U001", "ORD-24184"], check: `${ORDER_COLS}, decision, decided_by FROM orders WHERE order_id = 'ORD-24184'` },
  "Q5A.5": { params: ["U001", "ORD-24184"], check: `${ORDER_COLS}, decision, decided_by FROM orders WHERE order_id = 'ORD-24184'` },
  "Q6A.1": { params: [] },
  "Q6A.2": { params: ["FSH-RDS-180"] },
  "Q6A.3": { params: ["PO-0012", "FSH-RDS-180", "SUP-01", 40, "2026-11-02 09:00:00+09"],
             check: "SELECT po_id, sku, supplier_id, order_qty, eta, status FROM purchase_orders WHERE po_id = 'PO-0012'" },
  "Q6A.4": { setup: "UPDATE orders SET order_status = 'รอสั่งซื้อจาก Supplier' WHERE order_id = 'ORD-24184'",
             params: ["PO-0011", "FSH-RDS-180"], check: `${ORDER_COLS}, po_id FROM orders WHERE order_id = 'ORD-24184'` },
  "Q7A.1": { params: ["ลูกค้าขอยกเลิกผ่าน Rakuten", "U001", "ORD-24183"], check: `${ORDER_COLS}, cancel_reason, cancelled_by FROM orders WHERE order_id = 'ORD-24183'` },
  "Q7A.2": { params: [2, "FSH-MLR-240"], check: "SELECT sku, in_house_qty, updated_at FROM stock WHERE sku = 'FSH-MLR-240'" },
  "Q8A.1": { params: ["ORD-24178"] },
  "Q8A.2": { params: ["4418-2291-4178", "Yamato Transport", "ORD-24178"], check: `${ORDER_COLS}, tracking_number, carrier_name FROM orders WHERE order_id = 'ORD-24178'` },
  "Q8A.3": { params: ["4418-2291-4174"] },
  "Q9A.1": { params: ["RSL ปกติ", "Rakuten Ichiba"] },
  "Q9A.2": { params: ["ORD-24181"], check: "SELECT label_id, order_id, label_status, printed_at FROM label WHERE order_id = 'ORD-24181'" },
  "Q9A.3": { params: ["ORD-24181"], check: `${ORDER_COLS} FROM orders WHERE order_id = 'ORD-24181'` },
  "Q10A.1": { params: ["2025-10-12"] },
  "Q10A.2": { params: ["2025-10-12"] },
  "Q10A.3": { params: ["2025-10-12"] },
  "Q10A.4": { params: ["2025-10-12"] },
  "Q10A.5": { params: ["order", "ORD-24161", "U001"], check: "SELECT log_id, data_type, record_id, deleted_by FROM deletion_log WHERE log_id > 5" },
  "Q10A.6": { params: [["ORD-24161"]], check: "SELECT COUNT(*) AS remaining FROM orders WHERE order_id = 'ORD-24161'" },
  "Q10A.7": { params: [[1, 2]], check: "SELECT cost_id, sku FROM cost_calculation_log ORDER BY cost_id" },
  "Q10A.8": { params: [[1]], check: "SELECT label_id, order_id FROM label ORDER BY label_id" },
  "Q10A.9": { params: [["PO-0007", "PO-0009"]], check: "SELECT po_id, status FROM purchase_orders ORDER BY po_id" },
  "Q10A.10": { params: [] },
  "Q10A.11": { params: [["ORD-24160", "ORD-24161", "ORD-24170"]] },
  "Q10A.12": { params: ["ORD-24160", "U001"], check: "SELECT log_id, data_type, record_id, deleted_by FROM deletion_log WHERE log_id > 5" },
  "Q10A.13": { params: [["ORD-24160", "ORD-24170"]], check: "SELECT label_id, order_id FROM label ORDER BY label_id" },
  "Q10A.14": { setup: "DELETE FROM label WHERE order_id IN ('ORD-24160', 'ORD-24170')",
               params: [["ORD-24160", "ORD-24161", "ORD-24170"]], check: "SELECT order_status, COUNT(*) AS orders FROM orders GROUP BY order_status ORDER BY order_status" },
  "Q1S.1": { params: ["FSH-MLR-240", "สีเงินลายปลาซิว"] },
  "Q1S.2": { params: ["RSL-9f2240", "ORD-24183"], check: `${ORDER_COLS}, rsl_matched, rsl_reference_id FROM orders WHERE order_id = 'ORD-24183'` },
  "Q2S.1": { params: ["rk-mlr240-sv", "Rakuten Ichiba"] },
  "Q2S.2": { params: [1, "FSH-MLR-240", "สีเงินลายปลาซิว", "ORD-24190"], check: `${ORDER_COLS}, sku_rule_id, sku FROM orders WHERE order_id = 'ORD-24190'` },
  "Q3S.1": { params: ["FSH-MLR-240"] },
  "Q3S.2": { params: ["ยังไม่ได้จับคู่", "ORD-24190"], check: `${ORDER_COLS} FROM orders WHERE order_id = 'ORD-24190'` },
  "Q4S.1": { params: ["FSH-MLR-240"] },
  "Q4S.3": { params: ["FSH-MLR-240", 418.61, "U001"], check: "SELECT cost_id, sku, unit_cost, calculated_by FROM cost_calculation_log WHERE cost_id > 6" },
  "Q5S.1": { params: ["ORD-24174"] },
  "Q5S.2": { params: ["ORD-24174"], check: `${ORDER_COLS}, tracking_notified FROM orders WHERE order_id = 'ORD-24174'` },
  "Q6S.1": { params: ["RSL ปกติ", "Rakuten Ichiba"] },
  "Q6S.2": { params: ["ORD-24183", "RSL-STD-A6", "RSL-9f2240", 1, 1], check: "SELECT label_id, order_id, label_template, rsl_reference_id, parcel_seq, parcel_total, label_status FROM label WHERE order_id = 'ORD-24183'" },
  "Q6S.3": { params: ["ORD-24183"], check: `${ORDER_COLS} FROM orders WHERE order_id = 'ORD-24183'` },
  "Q7S.1": { params: ["ORD-24172"] },
  "Q7S.2": { params: [1, "OUT-LMP-021", "แสงวอร์ม"], check: "SELECT sku, in_house_qty, rsl_qty FROM stock WHERE sku = 'OUT-LMP-021'" },
  "Q7S.3": { params: [1, "FSH-MLR-240", "สีเงินลายปลาซิว"], check: "SELECT sku, in_house_qty, rsl_qty FROM stock WHERE sku = 'FSH-MLR-240'" },
  "Q7S.5": { params: ["ORD-24172"], check: `${ORDER_COLS}, stock_deducted, mp_stock_synced FROM orders WHERE order_id = 'ORD-24172'` },
};

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

writeFileSync(new URL("sql-results.json", import.meta.url), JSON.stringify(out, null, 2));
console.log(`${out.length} queries, ${failed} failed`);
process.exit(failed ? 1 : 0);
