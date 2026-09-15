# To-Do Checklists — โครงการจริง: Colorado Co., Ltd. ระบบจัดการหลังบ้าน เฟส 1 (Rakuten Pilot)

สร้างจาก [`biz-requirement.md`](../00-project-docs/biz-requirement.md) ซึ่งเป็นความต้องการทางธุรกิจจริงของโปรเจกต์เรา
(ไม่ใช่ระบบ KU Job ใน `sa-ref.pdf` — เอกสารนั้นเป็นแค่ตัวอย่าง/reference โครงสร้างรายงานจากกลุ่มอื่น ดูได้ที่ [`../todo-ref/`](../todo-ref/))

**ขอบเขตเฟส 1:** Rakuten Ichiba + Rakuten RMS + RSL เท่านั้น (Yahoo!/Amazon/Mercari อยู่นอกขอบเขต)
**เป้าหมาย 3 ระบบอัตโนมัติหลัก:** Auto Label Printing, Auto Reorder, Unit Cost Calculator

## 🚨 เริ่มที่นี่ก่อน

[0-URGENT-do-now.md](0-URGENT-do-now.md) — รวมทุกอย่างที่ต้องทำตอนนี้ (เรียงตามความสำคัญ) อัปเดตล่าสุดจากทุกบทสนทนา/เอกสาร ใช้ไฟล์นี้เป็นจุดเช็คแรกทุกครั้งที่เปิดงาน

## ไฟล์ทั้งหมด (เช็กลิสต์รายหัวข้อของรายงาน)

1. [01-chapter1-introduction.md](01-chapter1-introduction.md) — บทที่ 1 ที่มาและความสำคัญ (1.1–1.7)
2. [02-chapter2-business-process.md](02-chapter2-business-process.md) — Business Process / Use Case Diagram / CRUD (2.1–2.12)
3. [03-chapter2-use-case-descriptions.md](03-chapter2-use-case-descriptions.md) — Use Case Description, Sequence, Collaboration, UI ของ 20 use case (4 actor: เจ้าของ, Delivery, Marketplace, Supplier)
4. [04-chapter2-diagrams-database.md](04-chapter2-diagrams-database.md) — Class/DFD/State/Component/ER Diagram และ Table Structure
5. [05-chapter2-platform-testing.md](05-chapter2-platform-testing.md) — Platform, UI, Output, SQL, Testing, หน้าที่รับผิดชอบ
6. [06-grading-rubric-checklist.md](06-grading-rubric-checklist.md) — เกณฑ์ตรวจสอบ 35 ข้อของวิชา (เกณฑ์เดียวกับ `todo-ref/06-...` เพราะเป็นเกณฑ์กลางของวิชา ไม่ผูกกับโปรเจกต์ใดโปรเจกต์หนึ่ง)

## ไฟล์งานที่มีอยู่แล้ว (อยู่ใน `02-chapter2-business-process/`)

- `biz-flow-as-is.png` — Business Process เดิม (2.1)
- `biz-flow-to-be.png` — Business Process ใหม่ (2.4)
- `biz-flow-rel-use-case.png` — Business Process ที่สัมพันธ์กับ Use Case (2.6)
- `crud-table-as-is.png` — CRUD Table ก่อนปรับปรุง (2.9)
- `crud-table-to-be.png` — CRUD Table ที่ทบทวนแล้ว (2.12)
- `use-case.png` — Use Case Diagram (2.11) ⚠️ **ยังเป็น WIP อยู่ ต้องทบทวนก่อนสรุป**

## หมายเหตุ

- `todo-ref/` = เช็กลิสต์ชุดเก่าที่อิงจาก `sa-ref.pdf` (ตัวอย่างรายงาน KU Job) เก็บไว้เป็น reference โครงสร้าง/รูปแบบการเขียนเท่านั้น ไม่ต้องทำตามเนื้อหา
- `todo/` (ไฟล์นี้) = เช็กลิสต์ของจริงที่ใช้ทำงานสำหรับโปรเจกต์ Colorado/Rakuten
- ปัญหา/จุดที่ต้องแก้ที่เจอระหว่างทำงาน บันทึกแยกไว้ที่ [`issues-checklist.md`](issues-checklist.md) (ไม่ใช่ to-do รายหัวข้อ)
- ประเมินความพร้อมของข้อมูลเทียบกับ format ทั้งเล่ม (หัวข้อไหนพร้อมเขียน/หัวข้อไหนยังติด blocker) ดูที่ [`../00-project-docs/overview.md`](../00-project-docs/overview.md)
