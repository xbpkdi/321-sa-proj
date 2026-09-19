# 🚨 ตอนนี้ต้องทำอะไรบ้าง (รวมทุกอย่างที่ค้างอยู่ ณ ตอนนี้)

สรุปรวมจากทุกบทสนทนา/เอกสารที่มีอยู่ (`00-project-docs/summary.md`, `overview.md`, `todo/issues-checklist.md`, fix-notes ต่างๆ) เรียงตามลำดับความสำคัญ ใช้ไฟล์นี้เป็นจุดเช็คแรกทุกครั้งที่เปิดงาน ไม่ต้องไล่อ่านทุกไฟล์

---

## 🔴 บล็อกงานอื่นอยู่ — ทำก่อนสุด

### 1. คุยกับเจ้าของร้าน (Colorado Co., Ltd.) 4 เรื่อง
- [ ] **ยืนยันว่า "RSL" ที่ใช้จริงคือตัวไหน** — Rakuten Super Logistics มี 2 ระบบชื่อซ้ำกัน (ฝั่งญี่ปุ่นผูกกับ Rakuten Ichiba vs ฝั่งสหรัฐฯ อดีต Webgistix) แทบมั่นใจว่าเป็นตัวญี่ปุ่นแต่ต้องถามให้ชัด ก่อนเช็ค API สเปคจริง (รายละเอียด: `00-project-docs/summary.md` หัวข้อ 1.5)
- [ ] **ยื่นขอ Rakuten RMS API license key** — ยืนยันแล้วว่ามี API จริง ขั้นตอน: ยื่นคำขอ → ร้านอนุมัติผ่านหน้า RMS "WEB APIアクセス許可設定" → ได้ license key (หมดอายุทุก 1 ปี ต้องมีระบบเตือนต่ออายุ) — ยื่นไว้แต่เนิ่นๆ อย่ารอถึงตอนจะพัฒนาจริง
- [ ] **ถามว่า supplier รับออเดอร์ทางไหน** (อีเมล/ระบบ/โทร) — กระทบว่า Auto Reorder จะ "ส่งเอง" ได้จริงหรือแค่ "ร่างให้แล้วคนส่งเอง"
- [ ] **ถามรอบสต๊อกที่เหมาะสม** — ติดตามสต๊อกต่อเนื่อง (background job) ควรรันถี่แค่ไหน (ทุกกี่ชั่วโมง)

### 2. งาน Use Case Diagram — ✅ เสร็จแล้วทั้งหมด (2026-09-17)

ทุกขั้น (0–5) เสร็จแล้ว รูป+เนื้อหาล่าสุดอยู่ที่ `02-chapter2-business-process/img/final/` — ดูสถานะละเอียดและ use case list ล่าสุดที่ [`todo/02-chapter2-business-process.md`](02-chapter2-business-process.md) และเนื้อหาฉบับเต็มพร้อมวางในเล่มที่ [`02-chapter2-business-process/03-chapter2-content-draft.md`](../02-chapter2-business-process/03-chapter2-content-draft.md)

งานที่ยังเหลือ (ไม่ใช่งานเอกสารแล้ว):
- [ ] อัปเดตชีต Google Sheets จริง (`321-SA-proj-sheets` แท็บ "To-be") ให้ตรงกับ CRUD table ที่แก้แล้ว (`2.12-crud-table-to-be.png`)
- [ ] แก้ไฟล์ `.drawio.xml` ต้นฉบับของเพื่อนให้ตรงกับเวอร์ชัน (fixed)

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
