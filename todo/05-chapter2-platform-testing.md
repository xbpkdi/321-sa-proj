# บทที่ 2 (ตอนที่ 4) — Platform / UI / Output / SQL / Testing / หน้าที่รับผิดชอบ

- [ ] 2.22 Software development platform — ระบุ stack ที่ใช้จริง (ต้องรองรับการดึงข้อมูลจาก Rakuten RMS API + RSL)
- [ ] 2.23 Site map/UI structure — root = เข้าสู่ระบบ (Admin เท่านั้น ตาม biz-requirement.md ข้อ 10 ไม่มีระบบบัญชีลูกค้า) + ต้องรองรับ 2FA
- [ ] 2.24 Output Design (report) — รายงานที่ต้องมีตาม biz-requirement.md ข้อ 12: หน้าจอสรุป ณ จุดเดียว (ออเดอร์รอพิมพ์ label, สต๊อกต่ำกว่าเกณฑ์/สถานะ reorder, ต้นทุนต่อหน่วย, error/action ที่ล้มเหลว) + daily summary (ข้อ 9)
- [ ] 2.25 SQL Statement ใน Use case description
- [ ] 2.26 การทดสอบโปรแกรมทำงานตาม Use case description
- [ ] 2.27 หน้าที่รับผิดชอบ — แบ่งงานสมาชิกทีม

## ข้อกำหนดด้านความปลอดภัย/สิทธิ์ ที่ต้องออกแบบครอบคลุม (biz-requirement.md ข้อ 10, 11)

- [ ] เฉพาะ Admin เท่านั้นที่แก้ไข supplier / reorder quantity / threshold / cost formula ได้
- [ ] ต้องมี 2FA สำหรับบัญชี Admin
- [ ] ป้องกันข้อมูล: ที่อยู่ลูกค้า, ชื่อ/ราคาซัพพลายเออร์, ต้นทุนสินค้า, credential Rakuten/RSL, กฎ label/reorder
- [ ] ระบบไม่มีฟังก์ชันรับชำระเงิน (การชำระเงินอยู่ที่ Rakuten ทั้งหมด)
