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

> ⚠️ **อัปเดต 2026-09-15 (ล่าสุด):** ยึดสไตล์การวาด/เลขกำกับ UC ของ `sa-ref.pdf` (2.8/2.11) เป็นต้นแบบ — ใช้ตัวอักษรกำกับ actor: **M**=เจ้าของ/Admin, **S**=ระบบ, **D**=Delivery, **P**=Supplier, **R**=Marketplace เลขกำกับแบบ `1M)`, `2S)` ฯลฯ (CRUD Table sheet ของทีมเป็นแค่ตัวอย่าง ไม่ใช่แหล่งข้อมูลสุดท้ายแล้ว)

- [ ] **อยากอ่านฉบับเข้าใจง่ายก่อนเริ่ม** → [`02-chapter2-business-process/00-how-to-fix-simple.md`](../02-chapter2-business-process/00-how-to-fix-simple.md) (มี UC list + actor + รูปเปรียบเทียบ As-Is/To-be ครบ ใช้ไฟล์นี้เป็นหลัก)
- [ ] **ขั้น 0 — ทำ `use-case-as-is.png` (2.8)** — 3 actor (M, R, P) 13 UC ไม่มี "ระบบ"/"Delivery" ยัง — ดูรายละเอียดใน how-to-fix-simple.md
- [ ] **ขั้น 1 — แก้ `use-case.png` ให้เป็น `use-case-to-be.png` (2.11)** — ลบ 20 UC เดิมทิ้ง แทนด้วย 5 actor (M, S, D, R, P) 16 UC:
  - เพิ่ม actor "S" (ระบบ) และ "D" (Delivery) ใหม่
  - `4M) อนุมัติคำสั่งซื้อเพิ่มสต๊อก` ต้องเป็นของเจ้าของ/Admin เสมอ **แบบ human-in-the-loop** (ห้ามให้ `7S` ข้ามไปทำเอง — ดู `summary.md` หัวข้อ 2)
  - เพิ่ม `1M) เข้าสู่ระบบ` ที่ตกหล่นไปตอนร่างแรก (แพทเทิร์นเดียวกับ sa-ref ที่เพิ่ม "0A" login)
- [ ] **ขั้น 2 — แก้ `biz-flow-to-be.png` + `biz-flow-rel-use-case.png`** ตาม [`02-chapter2-business-process/02-biz-flow-fix-notes.md`](../02-chapter2-business-process/02-biz-flow-fix-notes.md) โดยใช้เลข UC เวอร์ชันใหม่ (M/S/D/R/P) จากขั้น 1:
  - แก้ label swimlane "f" → "Marketplace"
  - แก้ชื่อ UC ให้ตรงกับ process จริง
  - เคลียร์ process ที่ข้อความซ้ำกัน (กล่อง 8 กับ 9)
  - เคลียร์เลข UC ที่ชนกัน ("จับคู่ Order กับ RSL")
- [ ] **ขั้น 3 — อัปเดต `crud-table-to-be.png`** ให้ครอบคลุม UC ชุดใหม่ทั้งหมด
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
