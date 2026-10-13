// สร้างสไลด์นำเสนอ (.pptx) ระบบหลังบ้าน Colorado
// ใช้: cd report-doc/presentation && npm i && node build_deck.js
// รูปทั้งหมดใช้ชุดเดียวกับในรายงาน สีตาม DESIGN.md ของเว็บ (Atlassian tokens)
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(__dirname, "output", "Colorado-SA-presentation.pptx");
const BP = (n) => path.join(ROOT, "02-chapter2-business-process", "img", "final", n);
const DIA = (n) => path.join(ROOT, "03-chapter2-use-case-descriptions", "diagrams", "png", n);
const DB = (n) => path.join(ROOT, "04-chapter2-diagrams-database", "diagrams", "png", n);
const PLT = (n) => path.join(ROOT, "05-chapter2-platform-testing", "img", n);
const RESULTS = JSON.parse(fs.readFileSync(path.join(ROOT, "04-chapter2-diagrams-database", "sql", "sql-results.json"), "utf8"));
const UCS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "usecases.json"), "utf8"));

const COURSE = "01418321 SYSTEM ANALYSIS AND DESIGN";
const MEMBERS = [["นายธนภัทร พูลโภคา", "6710450911"], ["นายอชิระ ภู่รุ่งเรือง", "6710451488"], ["นางสาวปิยากร ผลพานิช", "6710451054"]];

// สีจาก DESIGN.md (ชื่อ token ของ Atlassian กำกับไว้)
const BRAND = "1868DB";    // color.background.brand.bold
const TEXT = "292A2E";     // color.text
const SUBTLE = "505258";   // color.text.subtle
const SUNKEN = "F8F8F8";   // elevation.surface.sunken
const CARD = "FFFFFF";     // elevation.surface.raised
const SELECTED = "E9F2FE"; // color.background.selected
const HEADER = "292A2E";   // color.background.neutral.bold
const BORDER = "DDDEDE";   // color.border (#0b120e24) บนพื้นขาว
const CORAL = "FF5A36";    // สีแบรนด์รอง
const FONT = "Sukhumvit Set";
const W = 13.333, M = 0.55;

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Colorado Back-Office System";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: SUNKEN },
  objects: [
    { rect: { x: 0, y: 0, w: W, h: 1.25, fill: { color: CARD } } },
    { line: { x: 0, y: 1.25, w: W, h: 0, line: { color: BORDER, width: 0.75 } } },
    { rect: { x: M, y: 0.36, w: 0.07, h: 0.6, fill: { color: CORAL } } },
    { rect: { x: 0, y: 7.1, w: W, h: 0.4, fill: { color: HEADER } } },
    { text: { text: "COLORADO BACK-OFFICE  ·  PHASE 1", options: { x: 8.4, y: 7.1, w: 3.5, h: 0.4, fontFace: FONT, fontSize: 9, bold: true, color: "B7B9BE", align: "right", valign: "middle", charSpacing: 1 } } },
    { placeholder: { options: { name: "title", type: "title", x: M + 0.22, y: 0.36, w: W - 2 * M - 0.22, h: 0.6, fontFace: FONT, fontSize: 24, bold: true, color: TEXT, valign: "middle", align: "left", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.1, y: 7.13, w: 0.7, h: 0.34, fontFace: FONT, fontSize: 11, bold: true, color: CARD, align: "center", valign: "middle" },
});
pres.defineSlideMaster({ title: "PLAIN", background: { color: SUNKEN }, objects: [],
  slideNumber: { x: 12.1, y: 7.05, w: 0.7, h: 0.34, fontFace: FONT, fontSize: 11, bold: true, color: SUBTLE, align: "center", valign: "middle" } });

function txt(s, text, o) {
  s.addText(text, Object.assign({ isTextBox: true, fontFace: FONT, fontSize: 14, color: TEXT, margin: 0, valign: "top" }, o));
}
function content(en, th, crumb) {
  const s = pres.addSlide({ masterName: "CONTENT" });
  s.addText(th ? [{ text: en, options: { fontSize: 24, bold: true, color: TEXT } }, { text: "   " + th, options: { fontSize: 15, color: SUBTLE } }] : en, { placeholder: "title" });
  txt(s, crumb.toUpperCase(), { x: M, y: 0.08, w: 8, h: 0.26, fontSize: 9, bold: true, color: BRAND, charSpacing: 1.5 });
  txt(s, "Colorado Co., Ltd. · 01418321", { x: M, y: 7.1, w: 6, h: 0.4, fontSize: 9, color: "B7B9BE", valign: "middle" });
  return s;
}
function panel(s, x, y, w, h, label) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: CARD }, line: { color: BORDER, width: 0.75 } });
  if (label) txt(s, label.toUpperCase(), { x: x + 0.2, y: y + 0.14, w: w - 0.4, h: 0.28, fontSize: 9.5, bold: true, color: BRAND, charSpacing: 1 });
}
function pngSize(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
function img(s, file, x, y, w, h) {
  const [iw, ih] = pngSize(file), sc = Math.min(w / iw, h / ih), pw = iw * sc, ph = ih * sc;
  s.addImage({ path: file, x: x + (w - pw) / 2, y: y + (h - ph) / 2, w: pw, h: ph });
}
function figure(s, file, x, y, w, h, label) {
  panel(s, x, y, w, h, label);
  img(s, file, x + 0.15, y + (label ? 0.5 : 0.15), w - 0.3, h - (label ? 0.65 : 0.3));
}
function bullets(s, items, x, y, w, h, size = 15) {
  txt(s, items.map((t) => ({ text: t, options: { bullet: { indent: 16 }, breakLine: true } })), { x, y, w, h, fontSize: size, paraSpaceAfter: 6, lineSpacingMultiple: 1.05 });
}
function stat(s, x, y, w, h, big, label, color) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: CARD }, line: { color: BORDER, width: 0.75 } });
  txt(s, big, { x: x + 0.2, y: y + 0.12, w: w - 0.3, h: h * 0.5, fontSize: 32, bold: true, color: color || BRAND, valign: "middle" });
  txt(s, label, { x: x + 0.2, y: y + h * 0.58, w: w - 0.3, h: h * 0.4, fontSize: 12, color: SUBTLE });
}
const TH = (t) => ({ text: t, options: { bold: true, color: CARD, fill: { color: BRAND } } });
const TBL = { fontFace: FONT, color: TEXT, border: { type: "solid", pt: 0.5, color: BORDER }, valign: "middle", margin: [2, 5, 2, 5] };

// 1 ปก
{
  const s = pres.addSlide({ masterName: "PLAIN" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: BRAND }, line: { color: BRAND } });
  txt(s, COURSE, { x: M + 0.2, y: 0.9, w: 9, h: 0.3, fontSize: 11, bold: true, color: BRAND, charSpacing: 1.5 });
  txt(s, [{ text: "Colorado", options: { breakLine: true } }, { text: "Back-Office System" }, { text: ".", options: { color: CORAL } }],
    { x: M + 0.2, y: 1.4, w: 8.5, h: 2.0, fontSize: 48, bold: true, lineSpacingMultiple: 0.95 });
  txt(s, "ระบบจัดการหลังบ้านอัตโนมัติ เฟส 1: Rakuten Ichiba, Rakuten RMS และ RSL", { x: M + 0.2, y: 3.45, w: 7.8, h: 0.6, fontSize: 18, bold: true });
  txt(s, "Auto label · Auto reorder · Unit cost calculator", { x: M + 0.2, y: 4.05, w: 8.5, h: 0.4, fontSize: 15, color: SUBTLE });
  figure(s, PLT("ui/0-DashboardScreen.png"), 8.7, 1.0, 4.2, 3.0);
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.9, w: W, h: 1.6, fill: { color: HEADER }, line: { color: HEADER } });
  MEMBERS.forEach(([n, id], i) => {
    txt(s, n, { x: M + 0.2 + i * 3.4, y: 6.15, w: 3.3, h: 0.35, fontSize: 15, bold: true, color: CARD });
    txt(s, id + "  หมู่ 200", { x: M + 0.2 + i * 3.4, y: 6.52, w: 3.3, h: 0.3, fontSize: 12, color: "B7B9BE" });
  });
  txt(s, "เสนอ อาจารย์ สมโชค เรืองอิทธินันท์", { x: 9.6, y: 6.15, w: 3.3, h: 0.35, fontSize: 12, color: "B7B9BE", align: "right" });
  s.addNotes("Good morning. We are presenting a back-office system for Colorado Company Limited. My name is ... and my teammates are ... and ...");
}

// 2 แนะนำธุรกิจ (ภาษาอังกฤษตามที่วิชากำหนด)
{
  const s = content("Business introduction", "แนะนำธุรกิจ (พูดเป็นภาษาอังกฤษ)", "Introduction");
  panel(s, M, 1.55, 6.1, 5.3, "Who is Colorado");
  bullets(s, [
    "Sells imported and OEM products on Rakuten Ichiba in Japan",
    "Products: fishing gear and lures, outdoor goods, household items, Thai herbal inhalers",
    "Started in 2009 as a side business, now run by one owner",
    "Rakuten Super Logistics (RSL) stores and ships the products",
    "Next phases: Yahoo! Auctions and Amazon",
  ], M + 0.25, 2.05, 5.6, 4.6, 15);
  panel(s, 6.85, 1.55, 5.93, 5.3, "The problem in one line");
  txt(s, "Every order is handled by hand by one person.", { x: 7.1, y: 2.05, w: 5.4, h: 0.8, fontSize: 20, bold: true });
  bullets(s, [
    "Check new orders, check stock in two warehouses, match orders with RSL",
    "Format and print shipping labels, send tracking numbers",
    "Decide reorders without a clear rule",
    "Calculate real unit cost from 8 cost items",
  ], 7.1, 2.95, 5.4, 2.6, 14);
  txt(s, "Goal: automate the repetitive work, keep the owner in control of money decisions.", { x: 7.1, y: 5.75, w: 5.4, h: 0.8, fontSize: 14, bold: true, color: BRAND });
  s.addNotes("Colorado Company Limited sells imported and OEM products on Rakuten Ichiba in Japan, such as fishing lures, outdoor goods and Thai herbal inhalers. The business started in 2009 and is run by one owner. Rakuten Super Logistics, or RSL, keeps the stock and ships the parcels. The problem is that every order is handled by hand: checking orders, checking stock, matching with RSL, printing labels, sending tracking numbers, deciding reorders and calculating unit cost. Our system automates the repetitive steps, but the owner still approves every decision that spends money.");
}

// 3 วาระ
{
  const s = content("Agenda", "หัวข้อที่จะนำเสนอ", "Agenda");
  const items = [["01", "ปัญหาและวัตถุประสงค์", "ปัญหา 4 ข้อ เวลาที่เสียต่อวัน และระบบอัตโนมัติ 3 เรื่อง"],
    ["02", "Business Process และ Use Case", "As-Is, To-Be, Use Case Diagram และ CRUD"],
    ["03", "ออกแบบระบบ", "Use Case Description, Sequence, Class, State, DFD, ER"],
    ["04", "พัฒนาและทดสอบ", "Platform, หน้าจอ, รายงาน, SQL และผลการทดสอบ"]];
  items.forEach(([n, h, d], i) => {
    const x = M + i * 3.1;
    panel(s, x, 1.8, 2.95, 3.8, null);
    txt(s, n, { x: x + 0.25, y: 2.0, w: 2.5, h: 0.8, fontSize: 36, bold: true, color: i % 2 ? CORAL : BRAND });
    txt(s, h, { x: x + 0.25, y: 2.9, w: 2.5, h: 0.9, fontSize: 17, bold: true });
    txt(s, d, { x: x + 0.25, y: 3.85, w: 2.5, h: 1.5, fontSize: 13, color: SUBTLE });
  });
  s.addNotes("เราจะเล่า 4 ส่วน เริ่มจากปัญหาของร้าน ต่อด้วย Business Process และ Use Case จากนั้นเป็นการออกแบบระบบ และจบที่การพัฒนาและผลการทดสอบ");
}

// 4 ปัญหาพร้อมตัวเลข
{
  const s = content("Problems", "ปัญหาที่พบและเวลาที่เสียไป", "01 Problems");
  const rows = [["งาน", "นาที/ออเดอร์", "5 ออเดอร์/วัน", "10 ออเดอร์/วัน"], ["ตรวจคำสั่งซื้อใหม่", "2", "10", "20"], ["เช็กสต๊อก 2 คลัง", "3", "15", "30"],
    ["จับคู่กับเลข RSL", "2", "10", "20"], ["จัดรูปแบบและพิมพ์ใบปะ", "3", "15", "30"], ["แจ้งเลขติดตาม", "2", "10", "20"], ["รวม (นาที)", "12", "60", "120"]];
  s.addTable(rows.map((r, i) => r.map((c) => (i === 0 ? TH(c) : { text: c, options: { bold: i === rows.length - 1 } }))),
    Object.assign({ x: M, y: 1.6, w: 7.2, colW: [3.3, 1.3, 1.3, 1.3], fontSize: 13 }, TBL));
  txt(s, "ค่าประมาณจากขั้นตอนที่เจ้าของเล่า ยังไม่ได้จับเวลาจริง", { x: M, y: 5.1, w: 7.2, h: 0.3, fontSize: 11, color: SUBTLE });
  stat(s, 8.1, 1.6, 2.2, 1.5, "1–2 ชม.", "งานมือต่อวัน");
  stat(s, 10.5, 1.6, 2.28, 1.5, "400 ¥", "ค่าส่งแพงกว่าคู่แข่งต่อชิ้น", CORAL);
  stat(s, 8.1, 3.3, 2.2, 1.5, "8 รายการ", "ต้องรวมเพื่อคำนวณต้นทุน 1 SKU");
  stat(s, 10.5, 3.3, 2.28, 1.5, "20 ชิ้น", "ของเสียใน binder ล็อตแรก 500 ชิ้น", CORAL);
  bullets(s, ["พิมพ์ใบปะหน้าพัสดุด้วยมือทุกออเดอร์", "เช็กสต๊อกข้ามคลังบริษัทและ RSL เอง", "สั่งซื้อเติมสต๊อกด้วยความรู้สึก", "คำนวณต้นทุนจริงต่อชิ้นยาก"], 8.1, 5.05, 4.7, 1.9, 13);
  s.addNotes("ร้านขาย 5-10 ชิ้นต่อวัน ทุกออเดอร์ต้องผ่าน 5 งานมือ รวมประมาณ 12 นาทีต่อออเดอร์ หรือ 1-2 ชั่วโมงต่อวัน ตัวเลขนี้เป็นค่าประมาณจากที่เจ้าของเล่า นอกจากนี้ค่าส่งเองแพงกว่าคู่แข่ง 400 เยนต่อชิ้น จึงต้องคำนวณต้นทุนให้แม่นก่อนตัดสินใจ");
}

// 5 วัตถุประสงค์และขอบเขต
{
  const s = content("Objectives and scope", "วัตถุประสงค์และขอบเขตเฟส 1", "01 Objectives");
  [["Auto label", "จัดรูปแบบใบปะหน้าพัสดุให้ทันทีเมื่อจับคู่ RSL เหลือแค่กดพิมพ์"], ["Auto reorder", "แจ้ง SKU ที่ต่ำกว่าจุดสั่งซื้อ เตรียมคำสั่งซื้อให้ เจ้าของกดอนุมัติ"],
   ["Unit cost", "คำนวณต้นทุนต่อหน่วยด้วยสูตรเดียวกันทุกครั้ง พร้อมบันทึกประวัติ"]].forEach(([h, d], i) => {
    panel(s, M + i * 4.1, 1.6, 3.95, 2.3, null);
    txt(s, h, { x: M + i * 4.1 + 0.25, y: 1.8, w: 3.5, h: 0.5, fontSize: 20, bold: true, color: BRAND });
    txt(s, d, { x: M + i * 4.1 + 0.25, y: 2.4, w: 3.5, h: 1.3, fontSize: 14 });
  });
  panel(s, M, 4.15, 6.1, 2.75, "ขอบเขตเฟส 1");
  bullets(s, ["Rakuten Ichiba + Rakuten RMS + RSL เท่านั้น", "ผู้ใช้คนเดียวคือเจ้าของ (Admin)", "Yahoo! Auctions, Amazon อยู่เฟสถัดไป", "ลูกค้ายังสั่งและชำระเงินผ่าน Rakuten ตามเดิม"], M + 0.25, 4.6, 5.6, 2.2, 14);
  panel(s, 6.85, 4.15, 5.93, 2.75, "Human-in-the-loop");
  txt(s, "ระบบทำงานซ้ำให้ แต่ทุกขั้นที่ผูกกับเงินจริง เช่น การสั่งซื้อจาก Supplier (5A) ต้องให้เจ้าของอนุมัติก่อน ตามคำแนะนำของอาจารย์", { x: 7.1, y: 4.6, w: 5.4, h: 2.1, fontSize: 15 });
  s.addNotes("เป้าหมายคือระบบอัตโนมัติ 3 เรื่อง ใบปะ การสั่งซื้อเติม และต้นทุนต่อหน่วย ขอบเขตเฟส 1 เฉพาะ Rakuten และ RSL จุดออกแบบสำคัญคือ human-in-the-loop การสั่งซื้อที่ใช้เงินจริงต้องให้เจ้าของกดอนุมัติก่อนเสมอ");
}

// 6 BP As-Is
{
  const s = content("Business process: As-Is", "ขั้นตอนเดิมและจุดที่เป็นปัญหา", "02 Business process");
  figure(s, BP("2.3-business-process-pain-points.png"), M, 1.5, 8.2, 5.45, "As-Is with pain points");
  panel(s, 8.95, 1.5, 3.83, 5.45, "Pain points");
  bullets(s, ["2.3.1 จับคู่ Order กับสต๊อกเอง ~5 นาที/ออเดอร์", "2.3.2 คำนวณความคุ้มค่าเอง 20–30 นาที/ครั้ง", "2.3.3 จัดรูปแบบใบปะเอง ~3 นาที/ออเดอร์", "2.3.4 ติดตามพัสดุและแจ้งลูกค้าเอง ~2 นาที/ออเดอร์"], 9.15, 2.0, 3.45, 4.8, 13);
  s.addNotes("Business Process เดิม Super Admin ทำทุกขั้นเอง จุดสีแดงคือปัญหา 4 จุด จับคู่สต๊อก คำนวณความคุ้มค่า จัดรูปแบบใบปะ และติดตามพัสดุ");
}

// 7 BP To-Be
{
  const s = content("Business process: To-Be", "ขั้นตอนใหม่ แยกงานระบบกับงานคน", "02 Business process");
  figure(s, BP("2.4-business-process-to-be.png"), M, 1.5, 7.4, 5.45, "To-Be");
  panel(s, 8.15, 1.5, 4.63, 5.45, "What changed");
  bullets(s, ["เพิ่ม actor ระบบ (System) ทำงานอัตโนมัติ 7 Use Case (1S–7S)", "ระบบเช็กสต๊อก จับคู่ RSL จัดรูปแบบใบปะ แจ้งเลขติดตาม ตัดสต๊อกเอง", "คนยังทำงานที่ต้องตัดสินใจ: ตรวจคำสั่งซื้อ อนุมัติการสั่งซื้อ พิมพ์ใบปะ ส่งมอบพัสดุ", "เพิ่ม 10A ลบข้อมูลเก่าตามคำแนะนำของอาจารย์"], 8.35, 2.0, 4.25, 4.8, 13);
  s.addNotes("Business Process ใหม่ แยก lane ระบบออกมา ระบบรับงานซ้ำ ส่วนคนยังตัดสินใจขั้นที่สำคัญ โดยเฉพาะการสั่งซื้อจาก Supplier");
}

// 8 Use Case Diagram
{
  const s = content("Use case diagram", "17 Use Case หลังทบทวน", "02 Use case");
  figure(s, BP("2.11-use-case-diagram-to-be.png"), M, 1.5, 6.2, 5.45, "To-Be use case");
  panel(s, 6.95, 1.5, 5.83, 5.45, "Use cases");
  const a = UCS.filter((u) => u.id.endsWith("A")).map((u) => `${u.id} ${u.name}`);
  const sy = UCS.filter((u) => u.id.endsWith("S")).map((u) => `${u.id} ${u.name}`);
  txt(s, "Admin (10)", { x: 7.15, y: 1.95, w: 2.8, h: 0.3, fontSize: 12, bold: true, color: BRAND });
  txt(s, a.join("\n"), { x: 7.15, y: 2.3, w: 2.8, h: 4.5, fontSize: 10.5, lineSpacingMultiple: 1.1 });
  txt(s, "System (7)", { x: 10.05, y: 1.95, w: 2.6, h: 0.3, fontSize: 12, bold: true, color: CORAL });
  txt(s, sy.join("\n"), { x: 10.05, y: 2.3, w: 2.6, h: 4.5, fontSize: 10.5, lineSpacingMultiple: 1.1 });
  s.addNotes("หลังวิเคราะห์ CRUD Table พบ Use Case ที่ขาด เช่น ตรวจคำสั่งซื้อ จับคู่กฎ SKU ตัดสต๊อก และลบข้อมูลเก่า รวมเป็น 17 Use Case Admin 10 และระบบ 7");
}

// 9 Use Case Description ตัวอย่าง 5A
{
  const s = content("Use case 5A: decide to reorder", "ตัวอย่าง Use Case Description + Sequence", "03 Design");
  figure(s, DIA("5A-sequence.png"), M, 1.5, 6.6, 5.45, "Sequence diagram 5A");
  panel(s, 7.35, 1.5, 5.43, 5.45, "Human-in-the-loop");
  const uc = UCS.find((u) => u.id === "5A");
  bullets(s, [`Goal: ${uc.goal}`, "Q5A.1–Q5A.2 ดึงต้นทุนต่อหน่วยล่าสุดและราคาขาย", "Q5A.3 Expected Margin = selling_price − unit_cost", "คุ้มค่า → Q5A.4 ส่งต่อ 6A สั่งซื้อ", "ไม่คุ้มค่า → Q5A.5 ส่งต่อ 7A ยกเลิก"], 7.55, 2.0, 5.05, 4.8, 13);
  s.addNotes("ตัวอย่าง Use Case 5A ระบบคำนวณต้นทุนและกำไรที่คาดให้ แต่ปุ่มคุ้มค่าหรือไม่คุ้มค่าต้องให้เจ้าของกดเอง ทุก query มีเลขตาม Use Case เช่น Q5A.1 ถึง Q5A.5");
}

// 10 Class diagram
{
  const s = content("Class diagram", "Screen → Controller → Repository → DBConnector", "03 Design");
  figure(s, DB("class-4.png"), M, 1.5, 12.23, 5.45, "คำนวณต้นทุนและสั่งซื้อเติม (4/8)");
  s.addNotes("Class Diagram ได้จาก object ทุกตัวใน Sequence Diagram แบ่งเป็น 7 รูปตามกลุ่มงาน มีความสัมพันธ์ครบ 4 แบบ สืบทอด association dependency และ aggregation");
}

// 11 State diagram
{
  const s = content("State diagram: Order", "สถานะ Order และ SQL ที่เปลี่ยนสถานะ", "03 Design");
  figure(s, DB("state.png"), M, 1.5, 4.6, 5.45, null);
  panel(s, 5.35, 1.5, 7.43, 5.45, "How to read");
  bullets(s, ["ทุกเส้นเขียนเป็น [เงื่อนไข] event / Use Case", "ทุกครั้งที่สถานะเปลี่ยน ระบบ UPDATE orders.order_status ตามเลข query บนเส้น", "เส้นทางหลัก: 4A → 2A → 2S → 3S → 1S → 6S → 9A → 8A → 5S → 7S", "สต๊อกไม่พอ: 3S → 5A → 6A หรือ 7A", "Order ที่ปิดแล้วเก่ากว่า 12 เดือนถูกลบด้วย 10A"], 5.55, 2.0, 7.0, 4.8, 14);
  s.addNotes("State Diagram ของ Order ทุกเส้นมีเงื่อนไข event และ Use Case ที่ทำ และกำกับ query ที่ UPDATE สถานะ");
}

// 12 ER
{
  const s = content("ER diagram", "15 entity, ไม่มี M:N", "03 Design");
  figure(s, DB("er-0.png"), M, 1.5, 5.6, 5.45, "Overview");
  figure(s, DB("er-query-3.png"), 6.3, 1.5, 6.48, 5.45, "ER + query (products)");
  s.addNotes("ER Diagram มี 15 entity ชื่อตรงกับ CRUD Table เส้นคู่คือ total participation ทางขวาคือ ER พร้อม query สีแดงบอกว่า query ไหนใช้ entity ไหน");
}

// 13 DFD
{
  const s = content("Data flow diagram", "Context และ Level 0", "03 Design");
  figure(s, DB("dfd-context.png"), M, 1.5, 4.4, 5.45, "Context");
  figure(s, DB("dfd-level0.png"), 5.1, 1.5, 7.68, 5.45, "Level 0");
  s.addNotes("Context Diagram ระบบรับส่งข้อมูลกับ 5 external entity Level 0 แบ่งเป็น 6 process ตามกลุ่ม Use Case และ data store 9 กลุ่ม");
}

// 14 Platform + component
{
  const s = content("Platform and components", "เครื่องมือที่ใช้และการรวม component", "04 Build");
  figure(s, PLT("2.22-software-platform.png"), M, 1.5, 5.2, 5.45, "Stack of tools");
  figure(s, DB("component.png"), 5.9, 1.5, 6.88, 5.45, "Component diagram");
  s.addNotes("พัฒนาด้วย Next.js React TypeScript ฐานข้อมูล PostgreSQL เชื่อม Rakuten RMS และ RSL Component Diagram แสดงการรวมคลาสเป็น FrontEnd BackEnd และ Database");
}

// 15 Site map + UI
{
  const s = content("Site map and screens", "12 หน้าจอ ชื่อตาม Use Case", "04 Build");
  figure(s, PLT("sitemap.png"), M, 1.5, 4.7, 5.45, "Site map");
  [["ui/2A-OrderVerifyScreen.png", "OrderVerifyScreen (2A)"], ["ui/5A-6A-ReorderDecisionScreen.png", "ReorderDecisionScreen (5A, 6A)"],
   ["ui/4S-CostCalculatorScreen.png", "CostCalculatorScreen (4S)"], ["ui/9A-LabelPrintScreen.png", "LabelPrintScreen (9A)"]].forEach(([f, l], i) =>
    figure(s, PLT(f), 5.4 + (i % 2) * 3.7, 1.5 + Math.floor(i / 2) * 2.75, 3.6, 2.7, l));
  s.addNotes("Site map มี root คือหน้า Login ผู้ใช้คนเดียวคือ Admin ชื่อหน้าจอตรงกับ Screen object ใน Sequence Diagram");
}

// 16 Reports
{
  const s = content("Output design", "รายงาน 2 ฉบับ", "04 Build");
  figure(s, PLT("report/label-ORD-24178.png"), M, 1.5, 6.05, 5.45, "Shipping label (6S, 9A)");
  figure(s, PLT("report/unit-cost-FSH-MLR-240.png"), 6.73, 1.5, 6.05, 5.45, "Unit cost report (4S)");
  s.addNotes("รายงานใบปะสินค้าสร้างจาก 6S และพิมพ์จาก 9A รายงานต้นทุนต่อหน่วยมาจาก 4S ใช้สูตร Q4S.2");
}

// 17 SQL และการทดสอบ
{
  const s = content("SQL and testing", "รัน SQL จริงและทดสอบตาม Use Case", "04 Test");
  const failed = RESULTS.filter((r) => r.error).length;
  stat(s, M, 1.6, 2.9, 1.6, String(RESULTS.length), "SQL statements เลขตาม Use Case");
  stat(s, M + 3.05, 1.6, 2.9, 1.6, `${RESULTS.length - failed}/${RESULTS.length}`, "รันผ่านบน PostgreSQL ข้อมูลตัวอย่าง");
  stat(s, M, 3.35, 2.9, 1.6, "34", "กรณีทดสอบ (ปกติ + ผิดพลาด)", CORAL);
  stat(s, M + 3.05, 3.35, 2.9, 1.6, "34/34", "ผ่านทุกกรณี", CORAL);
  panel(s, M, 5.1, 5.95, 1.85, "วิธีทดสอบ");
  txt(s, "ข้อความที่คาดหวังคัดจาก Use Case Description คำต่อคำ กรณีระบบภายนอกล่มจำลองด้วยหน้า /dev", { x: M + 0.25, y: 5.55, w: 5.5, h: 1.3, fontSize: 13 });
  figure(s, PLT("test/5A-ok.png"), 6.65, 1.5, 6.13, 5.45, "5A: บันทึกผลการตัดสินใจสำเร็จ");
  s.addNotes(`SQL ทั้งหมด ${RESULTS.length} คำสั่ง รันกับ PostgreSQL ด้วยข้อมูลตัวอย่างผ่านทุกข้อ และทดสอบเว็บตาม Use Case Description 34 กรณี ผ่านทุกกรณี`);
}

// 18 สรุป
{
  const s = content("Summary", "สรุป", "Summary");
  [["Before", "งานมือ 1–2 ชม./วัน (ประมาณการ) ตัดสินใจสั่งซื้อด้วยความรู้สึก", CORAL], ["After", "ระบบทำ 7 Use Case เอง เจ้าของเหลือแค่ตรวจ อนุมัติ พิมพ์ และส่งมอบ", BRAND],
   ["Next", "เชื่อมฐานข้อมูลจริง ต่อ Rakuten RMS API จริง แล้วขยายไป Yahoo! Auctions และ Amazon", SUBTLE]].forEach(([h, d, c], i) => {
    panel(s, M + i * 4.1, 1.8, 3.95, 3.6, null);
    txt(s, h, { x: M + i * 4.1 + 0.25, y: 2.0, w: 3.5, h: 0.6, fontSize: 26, bold: true, color: c });
    txt(s, d, { x: M + i * 4.1 + 0.25, y: 2.8, w: 3.5, h: 2.4, fontSize: 16 });
  });
  s.addNotes("สรุป ระบบช่วยลดงานมือที่ซ้ำ แต่ยังให้เจ้าของคุมการตัดสินใจเรื่องเงิน ขั้นต่อไปคือต่อฐานข้อมูลและ API จริง");
}

// 19 ถาม-ตอบ
{
  const s = pres.addSlide({ masterName: "PLAIN" });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 0.18, h: 7.5, fill: { color: BRAND }, line: { color: BRAND } });
  txt(s, [{ text: "Q&A" }, { text: ".", options: { color: CORAL } }], { x: M + 0.2, y: 2.4, w: 8, h: 1.4, fontSize: 64, bold: true });
  txt(s, "ขอบคุณครับ/ค่ะ", { x: M + 0.2, y: 3.9, w: 8, h: 0.6, fontSize: 22, color: SUBTLE });
  s.addNotes("ขอบคุณครับ เปิดให้ถามคำถาม");
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
pres.writeFile({ fileName: OUT }).then(() => console.log("saved", OUT));
