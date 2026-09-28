# บทที่ 2 (ตอนที่ 3) — Diagrams และ Table Structure

## ⚠️ สิ่งที่ต้องรู้ก่อนเริ่มทำ ER Diagram / Query Table (2026-09-29)

Use Case Description เวอร์ชันไฟนอล (`03-chapter2-use-case-descriptions/00-use-case-descriptions.md`) มีจุดที่แก้ไข status ให้ flow ของ Order ต่อกันติดหลังตรวจ diagram — กระทบ query ที่ต้องออกแบบตอนทำ ER Diagram/Query Table ดังนี้:

- **UC 1S (จับคู่ Order กับเลข RSL) — กระทบ query โดยตรง:** query `Q4.2` ต้องมี field `order_status` เพิ่มเข้าไปด้วย ไม่ใช่แค่ `rsl_matched`/`rsl_reference_id`/`matched_at`:
  ```sql
  UPDATE orders SET rsl_matched=true, rsl_reference_id=$1, order_status='รอจัดรูปแบบใบปะสินค้า', matched_at=NOW() WHERE order_id=$2
  ```
  เหตุผล: UC 6S (จัดรูปแบบใบปะสินค้า) มี Pre-Condition ต้องการสถานะ `"รอจัดรูปแบบใบปะสินค้า"` แต่ไม่มี UC ไหนเคยตั้งสถานะนี้ให้มาก่อน

- **UC 4A (ดึง Order เข้าระบบ) — ไม่กระทบ query:** Post-Condition แก้จาก `"รอจับคู่ RSL"` เป็น `"รอตรวจสอบคำสั่งซื้อ"` ให้ตรงกับ Pre-Condition ของ UC 2A (query `Q11.1` เป็น INSERT generic อยู่แล้ว ไม่ได้ hardcode ค่า status)

ดูรายละเอียดสถานะทั้งหมดของแต่ละ UC ได้ที่ `00-use-case-descriptions.md` โดยตรงก่อนออกแบบ ER Diagram เพื่อให้ชื่อ field/สถานะตรงกัน

---

- [ ] 2.14 Class Diagram — abstraction จาก object ทุกตัวใน Sequence Diagram ทั้งหมด (super/sub, aggregation, dependency, association + attribute/method)
- [ ] 2.15 Data Flow Diagram
- [ ] 2.16 State Diagram ของ Order (state สำคัญ เช่น New → Label Printed → Shipped → Delivered → Cancelled ตาม field "Label-Printing Status" / "Reorder Status" ใน biz-requirement.md ข้อ 7.1)
- [ ] 2.17 Component Diagram
- [ ] 2.18 ER Diagram
- [ ] 2.19 ER Diagram พร้อม Query
- [ ] 2.20 Query Table
- [ ] 2.21 Table Structure — ออกแบบตารางจากฟิลด์ข้อมูลใน biz-requirement.md ข้อ 7.1 (SKU เป็น key หลักเชื่อมทุกระบบ — ข้อ 7.2)
  - [ ] ตารางสินค้า (PRODUCT) — Product Name, SKU, Variation, Purchase Price, Currency
  - [ ] ตารางออเดอร์ (ORDER) — Rakuten Order Number, Order Date, Product/SKU, Quantity, Delivery Address, Shipping Method
  - [ ] ตารางการจัดส่ง/label (SHIPPING_LABEL) — Label Template, Label-Printing Status
  - [ ] ตารางสต๊อก (STOCK) — In-house Inventory, RSL Inventory, Reorder Threshold, Reorder Quantity
  - [ ] ตาราง Reorder (REORDER) — Supplier, Lead Time, Reorder Status
  - [ ] ตารางต้นทุน (UNIT_COST) — Exchange Rate, International Freight, Duties, Rakuten Marketplace Fee, Domestic Shipping Cost, RSL Charges, Calculated Unit Cost
  - [ ] ตรวจสอบว่าตารางทั้งหมดตรงกับ CRUD Table ที่ทบทวนแล้ว (2.12) และ ER Diagram (2.18)
