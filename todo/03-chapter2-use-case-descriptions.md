# บทที่ 2 (ตอนที่ 2) — Use Case Description, Sequence Diagram, Collaboration Diagram, User Interface

⚠️ อิงจาก `use-case.png` ซึ่งยังเป็น **WIP** — รายชื่อ/จำนวน use case ด้านล่างอาจเปลี่ยนหลังทบทวนหัวข้อ 2.11
ทุก Use Case ควรมี 4 หัวข้อย่อยเหมือนรูปแบบใน `todo-ref`: Use Case Description → Sequence Diagram → Collaboration Diagram → User Interface
(ยกเว้น use case ที่เป็น automatic/system-triggered ล้วนๆ อาจไม่ต้องมี User Interface สำหรับ actor ภายนอก — ต้องตัดสินใจตอนทบทวน 2.11)

## Actor: เจ้าของ (Owner / Super Admin)

- [ ] UC01 เข้าสู่ระบบ — Description / Sequence / Collaboration / UI
- [ ] UC02 อัพเดทสถานะการจัดส่ง — Description / Sequence / Collaboration / UI
- [ ] UC03 เช็คสินค้าใน stock — Description / Sequence / Collaboration / UI
- [ ] UC04 จับคู่ Order กับ RSL — Description / Sequence / Collaboration / UI
- [ ] UC05 ระบบคำนวณ Cost ในการสั่งสินค้าเติม stock — Description / Sequence / Collaboration / UI *(= Unit Cost Calculator)*
- [ ] UC06 พิมพ์ใบปะสินค้า — Description / Sequence / Collaboration / UI *(= Auto Label Printing)*
- [ ] UC07 สั่งสินค้าจาก Supplier เติมเข้า stock — Description / Sequence / Collaboration / UI *(= Auto Reorder)*
- [ ] UC08 จัดส่งสินค้าให้ลูกค้าผ่าน Delivery — Description / Sequence / Collaboration / UI
- [ ] UC09 ส่งเลขติดตามสินค้าให้ลูกค้า — Description / Sequence / Collaboration / UI
- [ ] UC10 ยกเลิก Order — Description / Sequence / Collaboration / UI
- [ ] UC11 ตั้งกฎ SKU — Description / Sequence / Collaboration / UI
- [ ] UC12 จับคู่ SKU — Description / Sequence / Collaboration / UI
- [ ] UC13 ตัดสินใจการสั่งซื้อสินค้ามาเติม Stock จากการคำนวณ Cost ที่ระบบคำนวณให้ — Description / Sequence / Collaboration / UI
- [ ] UC14 จัด Format ใบปะสินค้า — Description / Sequence / Collaboration / UI
- [ ] UC15 ติดตามการจัดส่งให้ลูกค้า — Description / Sequence / Collaboration / UI

## Actor: Delivery

- [ ] UC16 รับสินค้าจากร้านเพื่อมาส่งต่อให้ลูกค้าปลายทาง — Description / Sequence / Collaboration / UI
- [ ] UC17 ส่งเลขติดตามสินค้ากลับไปให้ร้าน — Description / Sequence / Collaboration / UI

## Actor: Marketplace

- [ ] UC18 สั่งสินค้า — Description / Sequence / Collaboration / UI
- [ ] UC19 อัพเดทสถานะการจัดส่ง — Description / Sequence / Collaboration / UI

## Actor: Supplier

- [ ] UC20 จัดส่งสินค้าให้ร้าน — Description / Sequence / Collaboration / UI

## สิ่งที่ต้องเช็คก่อนเริ่มเขียน Use Case Description (ตามเกณฑ์ใน `06-grading-rubric-checklist.md` ข้อ 18)

- [ ] แสดง actor ตาม uc ให้ตรงกับ use case diagram (2.11)
- [ ] logic ของ system/actor ต้องสอดคล้องกับ User Interface ที่จะออกแบบ (2.30)
- [ ] query ที่เกิดขึ้นต้องไปโผล่ใน ER Diagram พร้อม query (2.19) ให้ถูกต้อง
- [ ] เรียงเนื้อหา: uc description 1 อัน → sequence diagram → collaboration diagram ของอันนั้นก่อน แล้วค่อยไป uc ถัดไป (ห้ามแยกทำ description ให้ครบทุกอันก่อนแล้วค่อยไปทำ diagram)
