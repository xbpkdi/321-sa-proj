# บทที่ 2 (ตอนที่ 1) — Business Process / Use Case Diagram / CRUD

ไฟล์งานที่มีอยู่แล้วอยู่ใน `02-chapter2-business-process/` (โฟลเดอร์เก็บไฟล์ ไม่ใช่ไฟล์ todo นี้)

- [x] 2.1 Business Process เดิม (As-Is) — มีไฟล์ `biz-flow-as-is.png` แล้ว (สายงาน Order/Stock/Shipping/Cost × Marketplace/Super Admin/Supplier/Delivery)
- [ ] 2.2 คำอธิบาย Business Process เดิม — ยังไม่เขียน (ต้องอธิบายทุกขั้นตอนจากรูป as-is ว่าใครทำอะไร ได้ผลอะไร)
- [ ] 2.3 ปัญหาของ Business Process เดิม — ยังไม่เขียน (สรุปจาก biz-requirement.md ข้อ 2.1–2.3: พิมพ์ label มือ, เช็คสต๊อกข้ามคลังมือ, reorder ด้วยความรู้สึก, คำนวณต้นทุนยาก)
- [ ] 2.4 Business Process ใหม่ (To-Be) — มีไฟล์ `biz-flow-to-be.png` แต่ **มีปัญหาต้องแก้** (label swimlane พิมพ์ผิด "f") ดู [`02-biz-flow-fix-notes.md`](../02-chapter2-business-process/02-biz-flow-fix-notes.md) (หรืออ่านฉบับง่าย: [`00-how-to-fix-simple.md`](../02-chapter2-business-process/00-how-to-fix-simple.md))
- [ ] 2.5 คำอธิบาย Business Process ใหม่ — ยังไม่เขียน (ต้องระบุว่า process ใด manual/automatic และ process ใดแก้ปัญหาข้อใน 2.3)
- [ ] 2.6 Business Process ที่สัมพันธ์กับ Use Case — มีไฟล์ `biz-flow-rel-use-case.png` แต่ **มีปัญหาต้องแก้** (ชื่อ UC ไม่ตรง process, เลข UC ชนกัน) ดู [`02-chapter2-business-process/02-biz-flow-fix-notes.md`](../02-chapter2-business-process/02-biz-flow-fix-notes.md)
- [ ] 2.7 ตารางจับคู่ระหว่าง Business Process และ Use Case Diagram — ยังไม่ทำ (ตาราง BP ↔ UC ทุกตัวต้องมาจาก BP)
- [ ] 2.8 Use Case Diagram ก่อนปรับปรุง — ยังไม่แยกทำ (ปัจจุบันมีแต่เวอร์ชัน WIP ใน `use-case.png`)
- [x] 2.9 CRUD Table ก่อนปรับปรุง — มีไฟล์ `crud-table-as-is.png` แล้ว
- [ ] 2.10 คำอธิบาย CRUD Table ก่อนปรับปรุง — ยังไม่เขียน (ชี้ว่ายังขาด UC อะไรจากการวิเคราะห์)
- [ ] 2.11 Use Case ที่ปรับปรุงแล้ว — มีไฟล์ `use-case.png` แต่ **ยังเป็น WIP** (20 UC: เจ้าของ 15, Delivery 2, Marketplace 2, Supplier 1) ต้องตรวจทาน/สรุปให้เป็นเวอร์ชันสุดท้าย ดู [`01-use-case-diagram-fix-notes.md`](../02-chapter2-business-process/01-use-case-diagram-fix-notes.md) (หรืออ่านฉบับง่าย: [`00-how-to-fix-simple.md`](../02-chapter2-business-process/00-how-to-fix-simple.md))
- [x] 2.12 CRUD Table ที่ทบทวนแล้ว — มีไฟล์ `crud-table-to-be.png` แล้ว (ต้องเช็คว่าครอบคลุม 20 UC ที่ปรับปรุงในข้อ 2.11 ครบหรือยัง)

## รายชื่อ Use Case ปัจจุบันใน `use-case.png` (WIP — ใช้ตรวจทานสำหรับ 2.7/2.8/2.11)

**Actor: เจ้าของ (Owner/Super Admin)**
1. เข้าสู่ระบบ
2. อัพเดทสถานะการจัดส่ง
3. เช็คสินค้าใน stock
4. จับคู่ Order กับ RSL
5. ระบบคำนวณ Cost ในการสั่งสินค้าเติม stock
6. พิมพ์ใบปะสินค้า
7. สั่งสินค้าจาก Supplier เติมเข้า stock
8. จัดส่งสินค้าให้ลูกค้าผ่าน Delivery
9. ส่งเลขติดตามสินค้าให้ลูกค้า
10. ยกเลิก Order
11. ตั้งกฎ SKU
12. จับคู่ SKU
13. ตัดสินใจการสั่งซื้อสินค้ามาเติม Stock จากการคำนวณ Cost ที่ระบบคำนวณให้
14. จัด Format ใบปะสินค้า
15. ติดตามการจัดส่งให้ลูกค้า

**Actor: Delivery**
1. รับสินค้าจากร้านเพื่อมาส่งต่อให้ลูกค้าปลายทาง
2. ส่งเลขติดตามสินค้ากลับไปให้ร้าน

**Actor: Marketplace**
1. สั่งสินค้า
2. อัพเดทสถานะการจัดส่ง

**Actor: Supplier**
1. จัดส่งสินค้าให้ร้าน

> ⚠️ ต้องตรวจทานว่า Use Case ไหนควรเป็น manual (เจ้าของกดเอง) vs automatic (ระบบทำเอง เช่น Auto Label Printing / Auto Reorder / Unit Cost Calculator ตาม biz-requirement.md ข้อ 5) — ของ WIP ตอนนี้ผูกทุกอย่างไว้ที่ actor "เจ้าของ" เหมือนเป็น manual หมด อาจต้องแยก use case ที่เป็น system-triggered ออกจาก use case ที่ actor เป็นคนกด
