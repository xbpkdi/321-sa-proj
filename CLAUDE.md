# 321-sa-proj — รายงาน SA วิชา 01418321

ระบบหลังบ้าน Colorado Co., Ltd. เฟส 1 (Rakuten Ichiba + RMS + RSL เท่านั้น).
3 ระบบอัตโนมัติหลัก: Auto Label Printing, Auto Reorder, Unit Cost Calculator.
Actor 4 ตัว: เจ้าของ, Delivery, Marketplace, Supplier.

## อ่านอะไรก่อน (ตามลำดับ หยุดเมื่อพอ)
1. `todo/00-URGENT-do-now.md` — งานค้าง เรียงตามความสำคัญ
2. `todo/0X-*.md` — เช็กลิสต์รายบท (01 บท1, 02 BP/UC/CRUD, 03 UC desc, 04 diagram/DB, 05 platform/test, 06 rubric, 07 งานค้างฝั่ง frontend)
3. `00-project-docs/biz-requirement.md` — requirement จริง (source of truth)
4. `00-project-docs/summary.md` — สรุปการตัดสินใจ, โมเดล human-in-the-loop 3 ระดับ

## แผนที่ไฟล์
- `01-chapter1-introduction/chapter1.md` — บทที่ 1
- `02-chapter2-business-process/03-chapter2-content.md` — เนื้อหา 2.1–2.12
  - `src/*(fixed).drawio.xml` = ต้นฉบับล่าสุด, `img/final/` = รูปส่งเล่ม, `img/old/` = เก่า ไม่ต้องดู
- `03-chapter2-use-case-descriptions/00-use-case-descriptions.md` — UC desc ทั้งหมด (84KB ใหญ่ ใช้ grep หา UC id เช่น `5A`, `7S` แล้วอ่านเฉพาะช่วง)
  - `diagrams/mmd/*.mmd` = ต้นฉบับ sequence/collab, `diagrams/png/` = ผลลัพธ์ render
  - `ui-design-brief.md`, `frontend-build-plan.md` — สเปค UI/แผน frontend
- `01418321-final-project/` — โค้ด Next.js (git repo แยก, มี CLAUDE.md ของตัวเอง). ทำงานโค้ดให้เปิด claude ในโฟลเดอร์นั้น
- `todo-ref/` — เช็กลิสต์จากตัวอย่าง KU Job (reference format เท่านั้น ไม่ใช่เนื้อหาเรา)
- `sa-ref.pdf` (72MB) — รายงานตัวอย่าง. อย่าเปิดทั้งไฟล์; ใช้ `pages` เฉพาะหน้าที่ต้องการ. โครงหัวข้อสรุปไว้ใน `todo-ref/` แล้ว

## ประหยัด token
- ห้ามเปิด `.png`/`.pdf` ถ้าไม่ได้ถูกขอให้ดูภาพ — ใช้ `.mmd`/`.drawio.xml`/`.md` แทน
- `.drawio.xml` ยาวมาก: grep หา `value="..."` ที่ต้องการ อย่า Read ทั้งไฟล์
- `todo/06-grading-rubric-checklist.md` = `todo-ref/06-...` (ไฟล์เดียวกัน อ่านแค่อันเดียว)
- อย่าไล่อ่าน `node_modules`, `img/old/`, `*.bkp`

## Convention
- เอกสารเขียนภาษาไทย ศัพท์เทคนิคภาษาอังกฤษ
- UC id: เลข + `A`(Admin เป็นผู้เริ่ม) หรือ `S`(System auto) เช่น `1A`, `5S`. หัวข้อใน UC desc เป็น `## 5S) ...`
- Commit: แยกเป็นส่วนย่อย, รูปแบบ `docs: ...`
