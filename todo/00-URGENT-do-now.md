# 🚨 ตอนนี้ต้องทำอะไรบ้าง (รวมทุกอย่างที่ค้างอยู่ ณ ตอนนี้)

สรุปรวมจากทุกบทสนทนา/เอกสารที่มีอยู่ (`00-project-docs/summary.md`, `overview.md`, `todo/issues-checklist.md`, fix-notes ต่างๆ) เรียงตามลำดับความสำคัญ ใช้ไฟล์นี้เป็นจุดเช็คแรกทุกครั้งที่เปิดงาน ไม่ต้องไล่อ่านทุกไฟล์

---

## 🔴 บล็อกงานอื่นอยู่ — ทำก่อนสุด

### 1. คุยกับเจ้าของร้าน (Colorado Co., Ltd.) 4 เรื่อง
- [ ] **ยืนยันว่า "RSL" ที่ใช้จริงคือตัวไหน** — Rakuten Super Logistics มี 2 ระบบชื่อซ้ำกัน (ฝั่งญี่ปุ่นผูกกับ Rakuten Ichiba vs ฝั่งสหรัฐฯ อดีต Webgistix) แทบมั่นใจว่าเป็นตัวญี่ปุ่นแต่ต้องถามให้ชัด ก่อนเช็ค API สเปคจริง (รายละเอียด: `00-project-docs/summary.md` หัวข้อ 1.5)
- [ ] **ยื่นขอ Rakuten RMS API license key** — ยืนยันแล้วว่ามี API จริง ขั้นตอน: ยื่นคำขอ → ร้านอนุมัติผ่านหน้า RMS "WEB APIアクセス許可設定" → ได้ license key (หมดอายุทุก 1 ปี ต้องมีระบบเตือนต่ออายุ) — ยื่นไว้แต่เนิ่นๆ อย่ารอถึงตอนจะพัฒนาจริง
- [ ] **ถามว่า supplier รับออเดอร์ทางไหน** (อีเมล/ระบบ/โทร) — กระทบว่า Auto Reorder จะ "ส่งเอง" ได้จริงหรือแค่ "ร่างให้แล้วคนส่งเอง"
- [ ] **ถามรอบสต๊อกที่เหมาะสม** — ติดตามสต๊อกต่อเนื่อง (background job) ควรรันถี่แค่ไหน (ทุกกี่ชั่วโมง)

### 2. งาน Use Case Diagram — ทำตามลำดับนี้ (ห้ามสลับ)

> ⚠️ **เพิ่งเจอเพิ่ม (2026-09-15):** เรามีแค่ `use-case.png` ซึ่งควรจะเป็นเวอร์ชัน **2.11 "ที่ปรับปรุงแล้ว"** แต่ **2.8 "ก่อนปรับปรุง" (ร่างแรกจาก Business Process ตรงๆ ก่อนเช็ค CRUD) ยังไม่เคยทำเลย** — ต้องทำ 2.8 ก่อน ถึงจะรู้ว่า 2.11 "เพิ่ม/แก้" อะไรไปบ้างจากร่างแรก (ตามที่ rubric ข้อ 16 ต้องการ)

- [ ] **อยากอ่านฉบับเข้าใจง่ายก่อนเริ่ม** → [`02-chapter2-business-process/00-how-to-fix-simple.md`](../02-chapter2-business-process/00-how-to-fix-simple.md) (มีรูปเปรียบเทียบก่อน/หลัง เหมาะให้เพื่อนที่เพิ่งเข้ามาอ่าน)
- [ ] **ขั้น 0 — ทำ `use-case-before.png` (2.8 ก่อนปรับปรุง)** — ไล่ดู `biz-flow-to-be.png` ทีละ process แล้วแปลงเป็น use case ตรงๆ ยังไม่ต้องคิดเรื่อง manual/automatic หรือ human-in-the-loop (ทำแบบง่ายที่สุดก่อน จะสั้นกว่า 20 UC ที่มีตอนนี้)
- [ ] **ขั้น 1 — แก้ `use-case.png` ให้เป็น 2.11 "ที่ปรับปรุงแล้ว" เวอร์ชันสมบูรณ์** ตาม [`02-chapter2-business-process/01-use-case-diagram-fix-notes.md`](../02-chapter2-business-process/01-use-case-diagram-fix-notes.md):
  - แยก actor manual vs automatic **แบบ human-in-the-loop** (ห้ามย้าย UC7 reorder ไป auto เต็ม — ต้องมีจุดเจ้าของอนุมัติเสมอ ดู `summary.md` หัวข้อ 2)
  - เพิ่ม UC ที่ขาด 2 ตัว (รับออเดอร์ใหม่จาก Rakuten RMS, ตัดสต๊อกสินค้า)
  - แก้ชื่อ UC ที่ซ้ำ/ยาวเกินไป (UC2 "อัพเดทสถานะการจัดส่ง", UC13)
  - ตัดสินใจว่าต้องเพิ่ม actor "RSL" แยกหรือไม่
- [ ] **ขั้น 2 — แก้ `biz-flow-to-be.png` + `biz-flow-rel-use-case.png`** ตาม [`02-chapter2-business-process/02-biz-flow-fix-notes.md`](../02-chapter2-business-process/02-biz-flow-fix-notes.md) โดยใช้ชื่อ/เลข UC เวอร์ชันใหม่จากขั้น 1:
  - แก้ label swimlane "f" → "Marketplace"
  - แก้ชื่อ UC ให้ตรงกับ process จริง (โดยเฉพาะ "อัพเดทสถานะการจัดส่ง")
  - เคลียร์ process ที่ข้อความซ้ำกัน (กล่อง 8 กับ 9)
  - เคลียร์เลข UC ที่ชนกัน ("จับคู่ Order กับ RSL" มี 2 เลข)
- [ ] **ขั้น 3 — อัปเดต `crud-table-to-be.png`** ให้ครอบคลุม UC ที่เพิ่ม/แก้ไขใหม่ทั้งหมด
- [ ] **ขั้น 4 — ทำตารางจับคู่ BP ↔ UC (2.7)** ที่ยังไม่เคยทำเลย
- [ ] **ขั้น 5 — กลับมาติ๊ก resolve** ที่ `todo/issues-checklist.md` ปัญหา #1 และ #2 พร้อมสรุปว่าแก้อะไรไปบ้าง

---

## 🟡 สำคัญ แต่ยังไม่บล็อกทันที

- [ ] **เอาโมเดล human-in-the-loop 3 ระดับ ไปคุยกับอาจารย์รอบหน้า** เพื่อ confirm ก่อนวาด diagram เวอร์ชันสุดท้าย (โมเดลอยู่ใน `00-project-docs/summary.md` หัวข้อ 2 — auto เต็ม / auto+notify / auto-draft+ต้องอนุมัติ)
- [ ] **ตัดสินใจ software stack** (1.4 ในบทที่ 1 / 2.22 ในบทที่ 2) — ยังว่างอยู่ กระทบ component diagram, site map, background job
- [ ] **ตัดสินใจว่า "พิมพ์ label" เชื่อมเครื่องพิมพ์จริงยังไง** หรือแค่ generate PDF ให้คนพิมพ์เอง
- [ ] **วางแผนแบ่งงานทีม + timeline** (1.6 ในบทที่ 1 / 2.27 ในบทที่ 2) — ยังว่างอยู่เลย

---

## 🟢 Housekeeping (ทำเมื่อว่าง ไม่เร่ง)

- [ ] ใส่ไฟล์ใน `03-chapter2-use-case-descriptions/`, `04-chapter2-diagrams-database/`, `05-chapter2-platform-testing/` — ตอนนี้เป็นโฟลเดอร์ว่าง git ไม่ track เลยไม่ขึ้นบน GitHub
- [ ] พิจารณาย้าย `sa-ref.pdf` (69MB) ไปใช้ Git LFS — GitHub เตือนว่าไฟล์ใหญ่เกิน 50MB ที่แนะนำ

---

## หลังทำครบส่วน 🔴 แล้ว ค่อยเริ่มงานใหญ่ถัดไป

เริ่มเขียน Use Case Description จริง (2.13) โดยเริ่มจาก 3 UC หัวใจของโปรเจกต์ก่อน (ดู `todo/03-chapter2-use-case-descriptions.md`):
- UC05 ระบบคำนวณ Cost (Unit Cost Calculator)
- UC06 พิมพ์ใบปะสินค้า (Auto Label Printing)
- UC07 สั่งสินค้าจาก Supplier เติม stock (Auto Reorder — **ต้องมี human approve ตาม human-in-the-loop**)
