# บทที่ 2 (ตอนที่ 3) — Diagrams และ Table Structure

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
