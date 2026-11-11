# 321-sa-proj — รายงาน SA วิชา 01418321

ระบบหลังบ้าน Colorado Co., Ltd. เฟส 1 (Rakuten Ichiba + RMS + RSL เท่านั้น).
3 ระบบอัตโนมัติหลัก: Auto Label Printing, Auto Reorder, Unit Cost Calculator.
Actor 4 ตัว: เจ้าของ, Delivery, Marketplace, Supplier.

## อ่านอะไรก่อน
1. `_source/00-project-docs/biz-requirement.md` — requirement จริง (source of truth)
2. `_source/report-doc/รายละเอียดของคะแนนโครงงาน (ฉบับ update).xlsx` — เกณฑ์ให้คะแนน 36 ข้อ (ฉบับเก่า: `(old version).xlsx`)
3. `_source/sa-ref.pdf` (72MB) — รายงานตัวอย่าง เลขหน้า PDF = เลขหน้าพิมพ์ + 18 เปิดเฉพาะ `pages` ที่ต้องการ

## แผนที่ไฟล์
ไฟล์ที่ push มีแค่ `1-final-pdf/` (PDF/docx/pptx), `2-diagram/`, `3-database/`, `4-requirement/` ต้นฉบับและสคริปต์ทั้งหมดอยู่ใน `_source/` (ไม่อยู่ใน git) คำสั่ง build ทั้งหมดให้รันจากใน `_source/`
เนื้อหาเล่มทั้งหมดเขียนลง Word ผ่าน `_source/report-doc/` ไม่มีไฟล์ md ของเนื้อหาแล้ว โค้ดเว็บอยู่ที่ `01418321-final-project/` (repo แยก)
- `_source/report-doc/build_report.py` — สร้าง .docx, `_source/report-doc/export_pdf.sh` — สร้างทั้งเล่ม + อัปเดตสารบัญ + PDF ผ่าน Word
- `_source/report-doc/output/รูป-diagram/` — สำเนารูป diagram ทุกรูป ตั้งชื่อตามหัวข้อ (ไม่อยู่ใน git)
- `_source/report-doc/content/ch1.py` — บทคัดย่อ + บทที่ 1, `content/ch2.py` — ข้อความ/ตารางบทที่ 2
- `_source/report-doc/content/usecases.json` — Use Case Description ทั้ง 17 UC (source of truth ของ query `Q<UC>.n`)
- `_source/report-doc/content/tables.json` — คำอธิบายตารางและ attribute สำหรับ 2.17
- `_source/02-chapter2-business-process/src/*(fixed).drawio.xml` = ต้นฉบับ BP/UC (UC To-Be ใช้ `(fixed2)`), `img/final/` = รูปส่งเล่ม, `img/old/` = เก่า ไม่ต้องดู
- `_source/03-chapter2-use-case-descriptions/diagrams/mmd/*.mmd` = sequence/collab, `png/` = ผล render, `./render.sh [UC]` = render ใหม่, `check_diagrams.py` = ตรวจตามเกณฑ์
  - collaboration render ด้วย graphviz ผ่าน `collab_dot.py` (หน้าตาตาม sa-ref.pdf) ต้อง `brew install graphviz`
- `_source/04-chapter2-diagrams-database/` — `npm i` แล้ว
  - `sql/schema.sql`, `sql/seed.sql` — ฐานข้อมูล 15 ตาราง + ข้อมูลตัวอย่าง
  - `npm run sql` รัน query ทุกข้อ → `sql/sql-results.json` (2.23)
  - `npm run dict` → `sql/dictionary.json`, `queries.json`, `crud.json` (2.12, 2.16, 2.17)
  - `python3 diagrams/gen_diagrams.py && npm run diagrams` → รูป 2.14–2.19 ใน `diagrams/png/`
- `_source/05-chapter2-platform-testing/img/` — รูปหน้าจอ/รายงาน/ผลทดสอบ จับจากเว็บจริง

## ลำดับการสร้างเล่มใหม่
แก้ query ใน usecases.json → `npm run sql && npm run dict` → `python3 diagrams/gen_diagrams.py && npm run diagrams` → render mmd ที่แก้ → `python3 03-chapter2-use-case-descriptions/diagrams/check_diagrams.py` → `_source/report-doc/export_pdf.sh`

## ประหยัด token
- ห้ามเปิด `.png`/`.pdf` ถ้าไม่ได้ถูกขอให้ดูภาพ — ใช้ `.mmd`/`.drawio.xml`/`.json` แทน
- `.drawio.xml` ยาวมาก: grep หา `value="..."` ที่ต้องการ อย่า Read ทั้งไฟล์
- อย่าไล่อ่าน `node_modules`, `img/old/`, `*.bkp`

## Convention
- เอกสารเขียนภาษาไทย ศัพท์เทคนิคภาษาอังกฤษ
- UC id: เลข + `A`(Admin เป็นผู้เริ่ม) หรือ `S`(System auto) เช่น `1A`, `5S`. Query: `Q<UC>.n` เรียงตามขั้นตอน เช่น `Q3A.1`, `Q3A.2`
- Commit: แยกเป็นส่วนย่อย, รูปแบบ `docs: ...`
