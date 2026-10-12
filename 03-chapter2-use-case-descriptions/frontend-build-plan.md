# Frontend Build Plan — RSL Fulfillment Hub

> ไฟล์นี้คือแผนและบรีฟสำหรับ **สร้าง frontend จริงด้วย Next.js** (ไม่ใช่ทำ Artifact prototype แล้ว)
> อ่านคู่กับ `ui-design-brief.md` ซึ่งเป็นสเปคด้าน design system และรายละเอียดรายหน้าจอ

---

## 1. บริบทโปรเจกต์ (ต้องเข้าใจก่อนเริ่ม)

**ธุรกิจ**: Colorado Co., Ltd. ขายสินค้านำเข้าและสินค้า OEM ผ่านมาร์เก็ตเพลสอีคอมเมิร์ซในญี่ปุ่น
สินค้าหลัก: สินค้าอุปโภคนำเข้า, อุปกรณ์ตกปลา/เหยื่อล่อ, สินค้ากลางแจ้ง, ยาดมสมุนไพร
ช่องทางขาย: เฟส 1 เฉพาะ Rakuten Ichiba (ผ่าน Rakuten RMS) — Yahoo! Auctions / Amazon อยู่นอกขอบเขต (`biz-requirement.md` ข้อ 14)
Fulfillment: ใช้ **RSL** (Rakuten Super Logistics) เป็นผู้ให้บริการคลัง/จัดส่ง

**ปัญหาที่ระบบนี้มาแก้**:
- พิมพ์ใบปะหน้าพัสดุด้วยมือทุกออเดอร์
- ต้องเช็คสต๊อกข้ามหลายช่องทางและหลายคลัง (ในบริษัท + RSL) เอง
- ตัดสินใจสั่งซื้อเพิ่ม (reorder) ด้วยความรู้สึก ไม่มีเกณฑ์ชัดเจน
- คำนวณต้นทุนต่อหน่วยยาก ต้องรวม: ราคาซื้อ × อัตราแลกเปลี่ยน + ค่าขนส่งระหว่างประเทศ + ภาษีนำเข้า + ค่าธรรมเนียมมาร์เก็ตเพลส + ค่าส่งในประเทศ + ค่าธรรมเนียม RSL

**ผู้ใช้ระบบ**: มี actor เดียวคือ **Admin** (เจ้าของธุรกิจ) — ไม่มีหน้าบ้านสำหรับลูกค้า และ**ไม่มีฟังก์ชันรับชำระเงิน** (ลูกค้าจ่ายผ่าน Marketplace ทั้งหมด)

**สิ่งที่เจ้าของธุรกิจอยากเห็นในหน้าจอหลัก** (จาก business requirement ข้อ 12 — ใช้เป็นหลักคิดของ Dashboard):
- ออเดอร์ที่รอพิมพ์ label / สถานะการพิมพ์
- สต๊อกที่ต่ำกว่าเกณฑ์ / สถานะ reorder
- ต้นทุนต่อหน่วยของแต่ละสินค้า
- ข้อผิดพลาดหรือ action ที่ล้มเหลว **ต้องมีสีเตือนให้สังเกตง่ายและแก้ไขได้ทันที**

---

## 2. ไฟล์ที่ต้องอ่านก่อนเริ่ม

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `03-chapter2-use-case-descriptions/ui-design-brief.md` | **สเปคหลัก** — design system, รายชื่อ 12 หน้าจอ, สีสถานะ, โครงเมนู, spec ของ Dashboard |
| `03-chapter2-use-case-descriptions/00-use-case-descriptions.md` | **แหล่งความจริงของเนื้อหา** — ปุ่ม/field/ข้อความ error ทุกคำต้องมาจากไฟล์นี้ |
| `03-chapter2-use-case-descriptions/diagrams/png/*.png` | ลำดับการทำงานของแต่ละหน้า (sequence + collaboration diagram) |
| `00-project-docs/biz-requirement.md` | บริบทธุรกิจเต็ม ถ้าต้องตัดสินใจอะไรที่ไม่มีระบุไว้ |

---

## 3. Tech Stack

- **Next.js** (App Router) + TypeScript
- **Tailwind CSS**
- **shadcn/ui** — ใช้ตัวจริงได้เลย (`npx shadcn@latest add ...`) ไม่ต้องเขียนเลียนแบบเหมือนตอนทำ Artifact
- **Lucide icons**
- **Noto Sans Thai** (Google Fonts)
- **Mock data** — ยังไม่ต่อ database จริง เพราะ ER Diagram ยังทำไม่เสร็จ (ดูข้อ 6)

---

## 4. Skills ที่ใช้

| สกิล | ที่มา | ใช้ตอนไหน |
|---|---|---|
| `impeccable` | มีอยู่แล้วในเครื่องมือ | ตลอดงาน — กัน UI ออกมาดู generic/AI-slop |
| `design-taste-frontend` | tasteskill | ตอนวาง design system (งานข้อ 5–8) |
| `high-end-visual-design` | tasteskill | ตอนขัดความเนียนของหน้าจอ |
| `minimalist-ui` | tasteskill | คุมไม่ให้รก เพราะ 12 หน้าข้อมูลหนาแน่น |
| `brandkit` | tasteskill | คุมสี/โทนให้สม่ำเสมอทั้ง 12 หน้า |
| `full-output-enforcement` | tasteskill | ตอนไล่ทำ 12 หน้า กันทำไม่ครบ/ตัดจบกลางคัน |

ติดตั้ง tasteskill ด้วย:
```bash
npx skills add Leonxlnx/taste-skill
```
(ใช้ space เลือกเฉพาะ 5 ตัวข้างบน, enter ยืนยัน — ไม่ต้องเลือก `industrial-brutalist-ui`, `image-to-code`, `imagegen-*`, `redesign-existing-projects`, `gpt-taste`, `stitch-design-taste`, `design-taste-frontend-v1`)

**หาเพิ่มได้**: ตอนเริ่มงานให้เช็ครายการ skill ที่มีในเครื่องอีกรอบ ว่ามีตัวที่เกี่ยวกับ Next.js / React / accessibility ที่ช่วยได้อีกไหม
นอกจากนี้โปรเจกต์มี agent `vercel:deployment-expert` ช่วยตอน deploy (งานข้อ 23) ได้

---

## 5. รายการงานทั้งหมด

### ช่วงเตรียม
- [x] 1. สร้างโปรเจกต์ Next.js ใน folder ใหม่ + Tailwind
- [x] 2. `npx shadcn@latest init` แล้ว add: button, card, table, badge, dialog, input, select, toast (sonner), sidebar, tabs, skeleton
- [x] 3. ติดตั้ง skills ของ tasteskill
- [x] 4. ตั้งฟอนต์ Noto Sans Thai + ติดตั้ง Lucide icons

### ช่วงวาง design system (ทำให้เสร็จก่อนลงหน้าจอ ไม่งั้นแก้ทีหลังเหนื่อย)
- [x] 5. ตั้ง theme ใน CSS variables ของ shadcn — น้ำเงิน `#1E3A8A` / พื้นขาว `#FFFFFF`,`#F8FAFC` / ตัวอักษร `#1E293B` / radius มน / shadow เบา
- [x] 6. Layout shell — sidebar (จัดกลุ่ม 5 หมวดตาม brief ข้อ 9.2) + topbar (ชื่อระบบ "RSL Fulfillment Hub" + ปุ่มสลับภาษา TH/EN) + ยุบเป็น drawer บนจอแคบ
- [x] 7. Shared components — **StatusBadge (5 สีตามกลุ่มสถานะใน brief ข้อ 4)**, DataTable, ConfirmDialog, Toast, EmptyState, LoadingState, **PrintLayout** (เลย์เอาต์สำหรับพิมพ์ ซ่อน sidebar/topbar ตอนสั่งพิมพ์)
- [x] 8. ไฟล์ mock data กลาง — shape ต้องตรงกับ query ใน use case description (Q1.1, Q2A.1, Q5.1 ฯลฯ)

### ช่วงทำหน้าจอ (12 หน้า)
- [x] 9. LoginScreen (1A) — อยู่นอก shell ไม่มี sidebar/topbar
- [x] 10. DashboardScreen — ไม่ได้ map กับ UC ไหน ออกแบบตาม brief ข้อ 9.1 + business requirement ข้อ 12 (ดูข้อ 1 ด้านบน)
- [x] 11. OrderVerifyScreen (2A)
- [x] 12. RslMatchScreen (1S)
- [x] 13. ProductScreen (3A)
- [x] 14. StockCheckScreen (3S)
- [x] 15. CostCalculatorScreen (4S)
- [x] 16. ReorderDecisionScreen (5A + 6A รวมหน้าเดียว)
- [x] 17. CancelOrderScreen (7A)
- [x] 18. ShipmentScreen (8A)
- [x] 19. LabelPrintScreen (9A)
- [x] 20. DataCleanupScreen (10A)

### ช่วงทำรายงาน (rubric ข้อ 31 — ต้องมี 2 reports)
- [x] 21. Print view **ใบปะสินค้า** — เปิดจาก LabelPrintScreen (โครงสร้างตาม brief ข้อ 10)
- [x] 22. Print view **รายงานต้นทุนต่อหน่วย** — เปิดจาก CostCalculatorScreen (โครงสร้างตาม brief ข้อ 10)

### ช่วงปิดงาน
- [x] 23. หน้า Site map (rubric ข้อ 29) — ผังต้นไม้ root = LoginScreen
- [x] 24. ไล่เช็คทุกหน้าว่าข้อความตรงคำต่อคำกับ `00-use-case-descriptions.md`
- [ ] 25. (ทางเลือก) deploy ขึ้น Vercel เพื่อได้ link แชร์ + capture รูปลงรายงานง่าย

---

## 6. กฎที่ห้ามพลาด

1. **ข้อความต้องตรงคำต่อคำกับ use case description** — ปุ่ม, label, ข้อความ error/success, ชื่อสถานะ ห้ามแปลหรือเปลี่ยนคำเอง (เช่น 2A ต้องเป็นปุ่ม "ยืนยันคำสั่งซื้อ" ไม่ใช่ "ยืนยัน")
2. **ชื่อหน้าจอต้องตรงกับชื่อ Screen object ในไดอะแกรม** (rubric ข้อ 23) เช่น `OrderVerifyScreen` ไม่ใช่ `OrderView`
3. **ภาษาไทยทั้งหมด** รวมถึง sidebar/หัวตาราง — มีปุ่มสลับ TH/EN ใน topbar ทุกหน้า แต่รอบนี้ทำเนื้อหาเต็มเฉพาะภาษาไทย
4. **ยังไม่ต่อ database จริง** — ใช้ mock data ไปก่อน เพราะ ER Diagram (`todo/04-chapter2-diagrams-database.md`) ยังทำไม่เสร็จ ถ้าต่อ backend ตอนนี้แล้ว schema เปลี่ยนจะต้องรื้อ
5. **ต้อง responsive** — รองรับ tablet/mobile ด้วย แต่มือถือเน้นใช้เช็คสถานะเป็นหลัก ส่วนฟอร์มตั้งค่ากฎ (SKU rule, threshold, สูตรต้นทุน) ออกแบบให้ใช้จริงบน desktop
6. **ห้ามเพิ่ม feature ที่ไม่มี UC รองรับ** — ถ้าคิดว่าควรมีอะไรเพิ่ม ให้ถามก่อน อย่าใส่เอง (เคยพิจารณาไอคอนกระดิ่งแจ้งเตือนแล้วตัดออกด้วยเหตุผลนี้) และถ้า brief ขัดกับ use case description ให้ยึด use case description เสมอ

---

## 7. เรื่องที่ยังไม่ได้ตัดสินใจ

- [x] ชื่อและตำแหน่งของ folder ใหม่สำหรับโปรเจกต์ Next.js — `01418321-final-project/`
- [x] จะทำทีละหน้าให้ดูแล้วค่อยไปต่อ หรือทำรวดเดียว 12 หน้าแล้วค่อยปรับ
- [ ] Backend stack (รอ ER Diagram เสร็จก่อน)
