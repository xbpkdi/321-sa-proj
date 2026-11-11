// สร้างสไลด์นำเสนอ (.pptx) ระบบหลังบ้าน Colorado สำหรับนำเสนอ 40 นาที (พูด ~35 นาที + ถาม-ตอบ)
// ใช้: cd report-doc/presentation && npm i && node build_deck.js
// รูปทั้งหมดใช้ชุดเดียวกับในรายงาน สีตาม DESIGN.md ของเว็บ (Atlassian tokens)
// ลำดับสไลด์ตามหัวข้อในรายงาน: บทที่ 1 → BP/Use Case/CRUD (2.1–2.12) → Description (2.13) → ER/ตาราง/Class/State (2.14–2.19)
// → สถาปัตยกรรมของเว็บจริง → Platform/UI/Report/SQL/ทดสอบ (2.20–2.24)
// ตัวเลขดึงจากไฟล์ของเล่ม (usecases.json, crud.json, sql-results.json, ch2.py TESTS) ไม่พิมพ์เอง
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const pptxgen = require("pptxgenjs");

const ROOT = path.join(__dirname, "..", "..");
const OUT = path.join(__dirname, "output", "Colorado-SA-presentation.pptx");
const BP = (n) => path.join(ROOT, "02-chapter2-business-process", "img", "final", n);
const DIA = (n) => path.join(ROOT, "03-chapter2-use-case-descriptions", "diagrams", "png", n);
const DB = (n) => path.join(ROOT, "04-chapter2-diagrams-database", "diagrams", "png", n);
const PLT = (n) => path.join(ROOT, "05-chapter2-platform-testing", "img", n);
const RESULTS = JSON.parse(fs.readFileSync(path.join(ROOT, "04-chapter2-diagrams-database", "sql", "sql-results.json"), "utf8"));
const CRUD = JSON.parse(fs.readFileSync(path.join(ROOT, "04-chapter2-diagrams-database", "sql", "crud.json"), "utf8"));
const UCS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "content", "usecases.json"), "utf8"));
// ตารางทดสอบ 2.24 อ่านจาก ch2.py ตรงๆ ให้จำนวนกรณีตรงกับเล่มเสมอ
const TESTS = JSON.parse(execFileSync("python3", ["-c", "import json,ch2;print(json.dumps(ch2.TESTS[1:]))"], { cwd: path.join(__dirname, "..", "content") }).toString());
const SQL_OK = RESULTS.filter((r) => !r.error).length;
const QCOUNT = (uc) => RESULTS.filter((r) => r.uc === uc).length;
const TEST_OK = TESTS.filter((t) => t[4] === "ผ่าน").length;
const N_TABLES = CRUD.tables.length;
// ชื่อ object ใน Sequence อ่านจาก mmd จริง เพื่อให้สไลด์ตรงกับรูปเสมอ (ชั้น View ของ MVC ใช้ชื่อ :<X>Screen เพราะเกณฑ์ข้อ 24 ห้ามตั้งชื่อว่า view)
const MMD = (uc) => fs.readFileSync(path.join(ROOT, "03-chapter2-use-case-descriptions", "diagrams", "mmd", `${uc}-sequence.mmd`), "utf8");
const PART = (uc, alias) => (MMD(uc).match(new RegExp(`participant ${alias} as :(\\w+)`)) || [])[1] || alias;
const VIEW_SUFFIX = "Screen";
const BACK_TO_ACTOR = ["1A", "2A", "2S", "3A", "3S", "4A", "4S", "5A", "5S", "6A", "6S", "7A", "7S", "8A", "9A", "10A", "1S"].filter((uc) => /-->>\s*Admin\b/.test(MMD(uc))).length;

const COURSE = "01418321 SYSTEM ANALYSIS AND DESIGN";
const MEMBERS = [["นายธนภัทร พูลโภคา", "6710450911"], ["นายอชิระ ภู่รุ่งเรือง", "6710451488"], ["นางสาวปิยากร ผลพานิช", "6710451054"]];
const SPK = ["ธนภัทร", "อชิระ", "ปิยากร"];

// สีจาก DESIGN.md (ชื่อ token ของ Atlassian กำกับไว้)
const BRAND = "1868DB";    // color.background.brand.bold
const TEXT = "292A2E";     // color.text
const SUBTLE = "505258";   // color.text.subtle
const SUBTLEST = "6B6E76"; // color.text.subtlest
const SUNKEN = "F8F8F8";   // elevation.surface.sunken
const WHITE = "FFFFFF";    // elevation.surface
const SELECTED = "E9F2FE"; // color.background.selected
const DARK = "292A2E";     // color.background.neutral.bold
const BORDER = "DDDEE1";   // color.background.accent.gray.subtler (ค่าทึบใกล้ color.border #0B120E24)
const CORAL = "FF5A36";    // สีแบรนด์ ใช้เป็นจุดและแถบเท่านั้น ไม่ใช้กับตัวอักษร
const SUCCESS = "4C6B1F";  // color.text.success
const SUCCESS_BG = "EFFFD6"; // color.background.success

// หน้าตา: แถบหัวสีเข้ม แท็บของเรื่องด้านบน พื้นเทาอ่อนกับการ์ดขาว สีตัดคือ coral ของแบรนด์
const BAND = "292A2E";      // color.background.neutral.bold
const PAGE = "F0F1F2";      // color.background.accent.gray.subtlest (= elevation.surface.hovered)
const ON_DARK = "DDDEE1";   // color.background.accent.gray.subtler ใช้เป็นตัวอักษรรองบนพื้นเข้ม
const ON_DARK_2 = "B7B9BE"; // color.border.accent.gray.subtle
const NUM_ON = "B7B9BE"; // color.border.accent.gray.subtle ใช้กับเลขส่วนปัจจุบัน
const DIM = "6B6E76";       // color.background.accent.gray.bolder
const HB = 1.25;
const T = {
  pageBg: PAGE,
  titleSub: ON_DARK,
  coverFoot: ON_DARK,
  master: (C) => [
    { rect: { x: 0, y: 0, w: C.W, h: HB, fill: { color: BAND }, line: { color: BAND, width: 0 } } },
    { rect: { x: C.M, y: 0.6, w: 0.08, h: 0.44, fill: { color: CORAL }, line: { color: CORAL, width: 0 } } },
    { rect: { x: C.M, y: 7.17, w: 0.05, h: 0.2, fill: { color: C.CORAL }, line: { color: C.CORAL, width: 0 } } },
    { text: { text: "Colorado Back-Office System", options: { x: C.M + 0.15, y: 7.1, w: 3.5, h: 0.34, fontFace: C.FONT, fontSize: 12, bold: true, color: C.TEXT, valign: "middle", margin: 0 } } },
    { placeholder: { options: { name: "title", type: "title", x: C.M + 0.28, y: 0.56, w: C.W - 2 * C.M - 0.3, h: 0.52, fontFace: C.FONT, fontSize: 26, bold: true, color: C.WHITE, valign: "middle", align: "left", margin: 0 }, text: "" } },
  ],
  chrome(s, i, cur, C) {
    // แท็บของเรื่อง แบ่งความกว้างเท่ากัน ส่วนปัจจุบันตัวขาวหนามีขีด coral ด้านล่าง เส้นคั่นใต้แถว
    const y = 0.1, h = 0.32, w = (C.W - 2 * C.M) / C.SECTIONS.length;
    s.addShape(C.pres.shapes.LINE, { x: C.M, y: y + h + 0.06, w: C.W - 2 * C.M, h: 0, line: { color: DIM, width: 0.75 } });
    C.SECTIONS.forEach((name, k) => {
      const x = C.M + k * w, on = k === cur;
      C.txt(s, [{ text: String(k + 1).padStart(2, "0") + "  ", options: { color: on ? NUM_ON : DIM } }, { text: name }], { x, y, w, h, fontSize: 12, bold: on, color: on ? C.WHITE : ON_DARK_2, valign: "middle" });
      if (on) s.addShape(C.pres.shapes.RECTANGLE, { x, y: y + h + 0.02, w: w - 0.3, h: 0.07, fill: { color: CORAL }, line: { color: CORAL, width: 0 } });
    });
    C.txt(s, [{ text: "ในเล่ม  ", options: { color: C.SUBTLEST } }, { text: C.NAV[i][2], options: { color: C.SUBTLE } }], { x: 4.3, y: 7.1, w: 7.3, h: 0.34, fontSize: 12, valign: "middle" });
    C.txt(s, `${i + 2} / ${C.TOTAL}`, { x: C.W - C.M - 0.85, y: 7.1, w: 0.85, h: 0.34, fontSize: 12, bold: true, color: C.SUBTLE, align: "right", valign: "middle" });
  },
  panel(s, x, y, w, h, kind, C) {
    // tint = การ์ดขาวมีแถบเหลืองด้านซ้าย ใช้กับกล่องสรุปข้างรูป
    s.addShape(C.pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: C.WHITE }, line: { color: C.WHITE, width: 0 } });
    if (kind === "tint") s.addShape(C.pres.shapes.RECTANGLE, { x, y, w: 0.08, h, fill: { color: CORAL }, line: { color: CORAL, width: 0 } });
  },
};
const DANGER = "AE2E24";   // color.text.danger
const DANGER_BG = "FFECEB"; // color.background.danger
const FONT = "Sukhumvit Set";
const MONO = "Menlo";
const W = 13.333, M = 0.6, TOP = 1.55, BOTTOM = 6.95;

// ส่วนของเรื่อง 6 ส่วน และหัวข้อในเล่มของแต่ละสไลด์ (เรียงตามลำดับสไลด์ เริ่มสไลด์ 2)
// ผู้พูด: ธนภัทร สไลด์ 1–14, อชิระ 15–33, ปิยากร 34–57 (ดู speaker_script/script.tex)
const SECTIONS = ["Introduction", "Business process", "Use case", "Design", "Architecture", "Build & test"];
const NAV = [
  ["Agenda", 0, "สารบัญ"],
  ["Business introduction", 0, "1.1 ที่มาและความสำคัญของปัญหา"],
  ["Problems", 0, "1.2 ปัญหาที่พบ และตารางที่ 1-1"],
  ["Objectives", 0, "1.3 วัตถุประสงค์"],
  ["Scope", 0, "1.5 ขอบเขตการทำงาน"],
  ["Business process: As-Is", 1, "2.1–2.2 Business Process เดิม"],
  ["Pain points", 1, "2.3 ปัญหาใน Business Process เดิม"],
  ["Business process: To-Be", 1, "2.4 Business Process ใหม่"],
  ["To-Be: who does what", 1, "2.5 คำอธิบาย Business Process ใหม่"],
  ["Business process to use case", 1, "2.6–2.7 Business Process ที่สัมพันธ์กับ Use Case"],
  ["Use case diagram: before", 1, "2.8–2.10 Use Case และ CRUD ก่อนปรับปรุง"],
  ["Use case diagram: reviewed", 1, "2.11 Use Case Diagram ที่ทบทวนแล้ว"],
  ["CRUD table", 1, "2.12 CRUD Table ที่ทบทวนแล้ว"],
  ["17 use cases", 2, "2.13 Use Case Description"],
  ["One order, end to end", 2, "2.13 และ 2.19 State Diagram"],
  ["Sequence diagram: MVC", 2, "2.13 Sequence Diagram และ 2.18 Class Diagram"],
  ["1A Log in", 2, "2.13 Use Case 1A"],
  ["2A · 2S · 3A", 2, "2.13 Use Case 2A, 2S, 3A"],
  ["3S Check stock", 2, "2.13 Use Case 3S"],
  ["3S Sequence diagram", 2, "2.13 Sequence Diagram 3S"],
  ["3S Collaboration diagram", 2, "2.13 Collaboration Diagram 3S"],
  ["1S · 6S · 9A Labels", 2, "2.13 Use Case 1S, 6S, 9A"],
  ["4S Unit cost", 2, "2.13 Use Case 4S"],
  ["5A Decide reorder", 2, "2.13 Use Case 5A"],
  ["5A Sequence diagram", 2, "2.13 Sequence Diagram 5A"],
  ["5A Collaboration diagram", 2, "2.13 Collaboration Diagram 5A"],
  ["6A Reorder and receive", 2, "2.13 Use Case 6A"],
  ["6A Sequence diagram", 2, "2.13 Sequence Diagram 6A"],
  ["6A Collaboration diagram", 2, "2.13 Collaboration Diagram 6A"],
  ["8A · 5S · 7S Ship and deduct", 2, "2.13 Use Case 8A, 5S, 7S"],
  ["7S Sequence diagram", 2, "2.13 Sequence Diagram 7S"],
  ["4A · 7A · 10A", 2, "2.13 Use Case 4A, 7A, 10A"],
  ["ER diagram", 3, "2.14 ER Diagram"],
  ["ER diagram with queries", 3, "2.15 ER Diagram พร้อม Query"],
  ["Tables and queries", 3, "2.16 ตาราง Query และ 2.17 โครงสร้างตาราง"],
  ["Class diagram", 3, "2.18 Class Diagram"],
  ["State diagram: Order (1/3)", 3, "2.19 State Diagram: Order ก่อนจัดส่ง"],
  ["State diagram: Order (2/3)", 3, "2.19 State Diagram: Order ช่วงจัดส่ง"],
  ["State diagram: Order (3/3)", 3, "2.19 State Diagram: Order ช่วงจัดส่ง"],
  ["State diagram: Reorder", 3, "2.19 State Diagram: Reorder"],
  ["State diagram: Label · SKU", 3, "2.19 State Diagram: Label, SKU"],
  ["State diagram: delivery · sync", 3, "2.19 State Diagram: delivery_status, sync_status"],
  ["Layers of the web app", 4, "2.18 Class Diagram และ 2.20 Platform"],
  ["executeWorkflow", 4, "2.11 Actor และ 2.13 Use Case ที่ระบบทำเอง"],
  ["Locks and double deduction", 4, "2.13 Use Case 3S, 7S และ 2.23 SQL"],
  ["External systems", 4, "2.20 Software Development Platform"],
  ["Security", 4, "2.13 Use Case 1A และ 2.17 admins, sessions"],
  ["Platform and components", 4, "2.20 Software Development Platform"],
  ["Site map and screens", 5, "2.21 Site Map / User Interface"],
  ["Output design", 5, "2.22 Output Design (Report)"],
  ["SQL results", 5, "2.23 ผลการรัน SQL"],
  ["Testing", 5, "2.24 การทดสอบโปรแกรม"],
  ["Live demo + SELECT", 5, "2.24 การทดสอบบนเว็บจริง และ 2.23 SQL"],
  ["Team and responsibilities", 5, "2.25 หน้าที่รับผิดชอบ"],
  ["Summary", 5, "สรุป"],
];
const TOTAL = NAV.length + 2; // ปก + ถาม-ตอบ

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.title = "Colorado Back-Office System";
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };

const C = { pres, W, M, TOP, BOTTOM, FONT, TEXT, SUBTLE, SUBTLEST, WHITE, BRAND, SELECTED, SUNKEN, BORDER, CORAL, DANGER, DANGER_BG, DARK, SECTIONS, NAV, TOTAL, txt: (...a) => txt(...a) };
pres.defineSlideMaster({ title: "CONTENT", background: { color: T.pageBg }, objects: T.master(C) });
pres.defineSlideMaster({ title: "PLAIN", background: { color: WHITE }, objects: [] });

function txt(s, text, o) {
  s.addText(text, Object.assign({ isTextBox: true, fontFace: FONT, fontSize: 16, color: TEXT, margin: 0, valign: "top" }, o));
}
function content(en, th) {
  const i = NAV.findIndex((r) => r[0] === en);
  if (i < 0) throw new Error("ไม่มีใน NAV: " + en);
  const s = pres.addSlide({ masterName: "CONTENT" });
  s.addText(th ? [{ text: en }, { text: "   " + th, options: { fontSize: 16, bold: false, color: T.titleSub || SUBTLE } }] : en, { placeholder: "title" });
  T.chrome(s, i, NAV[i][1], C);
  return s;
}
// บทพูดย่อในช่อง notes ขึ้นต้นด้วยชื่อผู้พูด
function notes(s, who, text) { s.addNotes(`[${SPK[who]}] ${text}`); }
// พื้นหลังของกลุ่มเนื้อหา kind: card = กล่องหลัก, tint = กล่องสรุป/ข้อสังเกตข้างรูป
function panel(s, x, y, w, h, kind = "card") { T.panel(s, x, y, w, h, kind, C); }
function pngSize(f) { const b = fs.readFileSync(f); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
// วางรูปให้พอดีกรอบ คืนตำแหน่งจริง align: c กลาง, l ชิดซ้าย, t ชิดบน
function img(s, file, x, y, w, h, o = {}) {
  const [iw, ih] = pngSize(file), sc = Math.min(w / iw, h / ih), pw = iw * sc, ph = ih * sc;
  const px = o.align && o.align.includes("l") ? x : x + (w - pw) / 2;
  const py = o.align && o.align.includes("t") ? y : y + (h - ph) / 2;
  if (o.card) T.panel(s, px - 0.18, py - 0.15, pw + 0.36, ph + 0.3, "card", C);
  if (o.frame) s.addShape(pres.shapes.RECTANGLE, { x: px - 0.02, y: py - 0.02, w: pw + 0.04, h: ph + 0.04, fill: { color: WHITE }, line: { color: BORDER, width: 0.75 } });
  s.addImage({ path: file, x: px, y: py, w: pw, h: ph });
  return { x: px, y: py, w: pw, h: ph };
}
function label(s, text, x, y, w, color = SUBTLE) {
  txt(s, text, { x, y, w, h: 0.3, fontSize: 13, bold: true, color, charSpacing: 1 });
}
// หัวข้อสั้น + คำอธิบาย เรียงลงมา ใช้ด้านข้างรูป
function points(s, items, x, y, w, o = {}) {
  const gap = o.gap || 1.0, mark = o.mark;
  items.forEach(([h, d], i) => {
    const yy = y + i * gap;
    let tx = x;
    if (mark) {
      s.addShape(pres.shapes.OVAL, { x, y: yy + 0.02, w: 0.36, h: 0.36, fill: { color: mark === DANGER ? DANGER_BG : SELECTED }, line: { color: mark === DANGER ? DANGER_BG : SELECTED } });
      txt(s, String(i + 1), { x, y: yy + 0.02, w: 0.36, h: 0.36, fontSize: 12, bold: true, color: mark, align: "center", valign: "middle" });
      tx = x + 0.55;
    }
    txt(s, h, { x: tx, y: yy, w: w - (tx - x), h: 0.4, fontSize: o.size || 17, bold: true });
    if (d) txt(s, d, { x: tx, y: yy + 0.4, w: w - (tx - x), h: gap - 0.45, fontSize: o.small || 13.5, color: SUBTLE });
  });
}
function stat(s, x, y, w, big, sub, color = BRAND) {
  txt(s, big, { x, y, w, h: 0.75, fontSize: 40, bold: true, color, valign: "bottom" });
  txt(s, sub, { x, y: y + 0.8, w, h: 0.5, fontSize: 14, color: SUBTLE });
}
function pill(s, text, x, y, color = BRAND, bg = SELECTED) {
  const w = 0.25 + text.length * 0.095;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.36, rectRadius: 0.18, fill: { color: bg }, line: { color: bg } });
  txt(s, text, { x, y, w, h: 0.36, fontSize: 12, bold: true, color, align: "center", valign: "middle" });
  return w;
}
function code(s, text, x, y, w, h, size = 12) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: SUNKEN }, line: { color: BORDER, width: 0.5 } });
  s.addText(text, { x: x + 0.15, y, w: w - 0.3, h, fontFace: MONO, fontSize: size, color: TEXT, valign: "middle", margin: 0 });
}
// ตารางเส้นบาง แถวหัวเป็นตัวหนาสีรอง cols = ความกว้างแต่ละคอลัมน์ (นิ้ว)
function grid(s, rows, x, y, cols, rh, o = {}) {
  const w = cols.reduce((a, b) => a + b, 0), size = o.size || 13;
  rows.forEach((r, i) => {
    const yy = y + i * rh;
    if (o.hl && o.hl(r, i)) s.addShape(pres.shapes.RECTANGLE, { x, y: yy, w, h: rh, fill: { color: o.hlColor || SELECTED }, line: { color: o.hlColor || SELECTED, width: 0 } });
    if (i) s.addShape(pres.shapes.LINE, { x, y: yy, w, h: 0, line: { color: BORDER, width: 0.5 } });
    let cx = x;
    r.forEach((c, j) => {
      const head = i === 0 && o.head !== false;
      const st = o.style ? o.style(r, i, j) : {};
      txt(s, String(c), Object.assign({ x: cx + 0.05, y: yy, w: cols[j] - 0.1, h: rh, fontSize: head ? size - 1 : size, bold: head || (o.boldCol === j), color: head ? SUBTLE : TEXT, valign: "middle" }, st));
      cx += cols[j];
    });
  });
}
// สไลด์รูป + กล่องสรุปด้านขวา คืนพิกัดของกล่องด้านขวา
function figure(s, file, imgW, o = {}) {
  const r = img(s, file, M, TOP - 0.05, imgW, BOTTOM - TOP - 0.05, { align: "l", card: true });
  const x = r.x + r.w + 0.6, w = W - M - x;
  panel(s, x - 0.25, TOP - 0.15, w + 0.45, BOTTOM - TOP + 0.15, o.kind || "tint");
  return { x, w };
}
// Sequence ที่ตัดเป็นส่วนแล้ว (split_png.py หัว object ซ้ำทุกส่วน) วางเรียงเป็นคอลัมน์ ให้ตัวอักษรใหญ่ที่สุด
function seqParts(s, uc, parts, cap) {
  const gap = 0.3, cw = (W - 2 * M - gap * (parts.length - 1)) / parts.length;
  const n = fs.readdirSync(path.dirname(DIA("x"))).filter((f) => new RegExp(`^${uc}-sequence-\\d+\\.png$`).test(f)).length;
  parts.forEach((p, k) => {
    const x = M + k * (cw + gap), f = DIA(n ? `${uc}-sequence-${p}.png` : `${uc}-sequence.png`);
    panel(s, x - 0.15, TOP - 0.15, cw + 0.3, BOTTOM - TOP + 0.15);
    label(s, n ? `${cap || "Sequence " + uc} · ส่วน ${p}/${n} ในเล่ม` : cap || "Sequence " + uc, x, TOP - 0.05, cw, BRAND);
    img(s, f, x, TOP + 0.3, cw, BOTTOM - TOP - 0.4, { align: "t" });
  });
}
// แถบเมตาของ Use Case: Actor / Trigger / Pre / Post เรียงลงมาในกล่อง tint ซ้าย
function meta(s, rows, x, y, w, gap = 1.0) {
  rows.forEach(([k, v], i) => {
    txt(s, k, { x, y: y + i * gap, w: 0.95, h: 0.4, fontSize: 12, bold: true, color: BRAND });
    txt(s, v, { x: x + 0.95, y: y + i * gap, w: w - 0.95, h: gap - 0.05, fontSize: 13 });
  });
}
function chip(s, t, x, y, w, h, kind) {
  const fill = kind === "auto" ? SELECTED : kind === "bad" ? DANGER_BG : kind === "ok" ? SUCCESS_BG : WHITE;
  const color = kind === "auto" ? BRAND : kind === "bad" ? DANGER : kind === "ok" ? SUCCESS : TEXT;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: kind ? fill : BORDER, width: 0.75 } });
  txt(s, t, { x, y, w, h, fontSize: 14, bold: true, color, align: "center", valign: "middle" });
}
function arrow(s, x, y, w, h = 0) {
  s.addShape(pres.shapes.LINE, { x, y, w, h, line: { color: SUBTLEST, width: 1.25, endArrowType: "triangle" } });
}

// ================================================================ ธนภัทร สไลด์ 1–14

// 1 ปก: แถบเข้มด้านบนแบบเดียวกับสไลด์เนื้อหา รูปหน้าจอวางคร่อมขอบแถบ ทีมอยู่บนพื้นเทาด้านล่าง
{
  const s = pres.addSlide({ masterName: "PLAIN" });
  s.background = { color: PAGE };
  const BH = 4.3;
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: BH, fill: { color: BAND }, line: { color: BAND, width: 0 } });
  s.addShape(pres.shapes.OVAL, { x: M, y: 0.5, w: 0.6, h: 0.6, fill: { color: WHITE }, line: { color: WHITE, width: 0 } });
  s.addImage({ path: path.join(__dirname, "..", "assets", "ku_logo.png"), x: M + 0.06, y: 0.56, w: 0.48, h: 0.48 });
  txt(s, COURSE, { x: M + 0.75, y: 0.55, w: 6, h: 0.5, fontSize: 12, bold: true, color: ON_DARK, charSpacing: 2, valign: "middle" });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 1.55, w: 0.08, h: 1.45, fill: { color: CORAL }, line: { color: CORAL, width: 0 } });
  txt(s, [{ text: "Colorado", options: { breakLine: true } }, { text: "Back-Office System" }, { text: ".", options: { color: CORAL } }],
    { x: M + 0.28, y: 1.45, w: 6.6, h: 1.7, fontSize: 44, bold: true, color: WHITE, lineSpacingMultiple: 0.95 });
  txt(s, "ระบบจัดการหลังบ้านอัตโนมัติ เฟส 1\nRakuten Ichiba, Rakuten RMS และ RSL", { x: M + 0.28, y: 3.2, w: 6.6, h: 0.8, fontSize: 16, color: ON_DARK_2, lineSpacingMultiple: 1.1 });
  img(s, PLT("ui/0-DashboardScreen.png"), 7.75, 0.55, W - 7.75 - M, 6.1, { frame: true, align: "t" });

  label(s, "ระบบอัตโนมัติ 3 เรื่อง", M, 4.7, 4, SUBTLE);
  let px = M;
  ["Auto label", "Auto reorder", "Unit cost calculator"].forEach((n) => { px += pill(s, n, px, 5.05) + 0.12; });
  label(s, "ผู้จัดทำ", M, 5.7, 4, SUBTLE);
  MEMBERS.forEach(([n, id], i) => {
    const x = M + i * 2.3;
    txt(s, n, { x, y: 6.05, w: 2.2, h: 0.32, fontSize: 13, bold: true });
    txt(s, id, { x, y: 6.37, w: 2.2, h: 0.3, fontSize: 12, color: SUBTLE });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 7.17, w: 0.05, h: 0.2, fill: { color: CORAL }, line: { color: CORAL, width: 0 } });
  txt(s, "หมู่ 200  ·  เสนอ อาจารย์ สมโชค เรืองอิทธินันท์", { x: M + 0.15, y: 7.1, w: 6, h: 0.34, fontSize: 12, color: SUBTLE, valign: "middle" });
  txt(s, `1 / ${TOTAL}`, { x: W - M - 0.85, y: 7.1, w: 0.85, h: 0.34, fontSize: 12, bold: true, color: SUBTLE, align: "right", valign: "middle" });
  notes(s, 0, "Good morning. We are presenting the back-office system for Colorado Company Limited, phase one, covering Rakuten Ichiba, Rakuten RMS and Rakuten Super Logistics. Our team is Thanapat Poonpoka, Achira Phurungrueang and Piyakorn Polpanich. The talk takes about thirty-five minutes, followed by questions.");
}

// 2 สารบัญ 3 ช่วง (ไม่ใส่ชื่อผู้พูดและเวลา)
{
  const s = content("Agenda", "3 ช่วงของการนำเสนอ");
  const parts = [
    ["ธุรกิจและ Business Process", "สไลด์ 1–14", ["แนะนำธุรกิจ (English)", "ปัญหาและวัตถุประสงค์", "Business Process เดิมและใหม่", "Use Case Diagram และ CRUD"]],
    ["Use Case และ Sequence", "สไลด์ 15–33", ["Use Case ทั้ง 17 ตัว", "Sequence แบบ MVC + Collaboration", "3S, 5A, 6A, 7S แบบละเอียด", "กลุ่ม Use Case ที่เหลือ"]],
    ["ออกแบบฐานข้อมูลและเว็บจริง", "สไลด์ 34–57", ["ER, ตาราง, Class", "State ของทุกข้อมูลที่ถูกแก้ไข", "สถาปัตยกรรม, SQL, การทดสอบ", "สาธิตเว็บ + SELECT สรุป"]],
  ];
  parts.forEach(([n, sub, items], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP - 0.15, 3.95, 4.3);
    txt(s, String(i + 1).padStart(2, "0"), { x, y: TOP, w: 3.6, h: 0.7, fontSize: 36, bold: true, color: BRAND });
    txt(s, n, { x, y: TOP + 0.75, w: 3.6, h: 0.45, fontSize: 19, bold: true });
    txt(s, sub, { x, y: TOP + 1.2, w: 3.6, h: 0.35, fontSize: 13, color: SUBTLE });
    txt(s, items.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x, y: TOP + 1.7, w: 3.6, h: 2.3, fontSize: 15, lineSpacingMultiple: 1.25 });
  });
  panel(s, M - 0.2, 6.0, W - 2 * M + 0.4, 0.85, "tint");
  txt(s, [{ text: "ตัวเลขทั้งหมดในสไลด์ตรงกับรายงานฉบับสุดท้าย  ", options: { bold: true } },
    { text: `${UCS.length} Use Case · ${N_TABLES} ตาราง · SQL ${SQL_OK}/${RESULTS.length} รันผ่าน · ทดสอบ ${TEST_OK}/${TESTS.length} กรณีผ่าน`, options: { color: SUBTLE } }],
    { x: M + 0.1, y: 6.0, w: W - 2 * M - 0.2, h: 0.85, fontSize: 16, valign: "middle" });
  notes(s, 0, "This is our agenda. I will introduce the business, the problems and the business process. Achira will walk through the use cases. Piyakorn will cover the database design, the architecture of the real web application, testing and a live demo with SELECT queries on the database. (เปลี่ยนเป็นภาษาไทยตั้งแต่สไลด์ 4)");
}

// 3 แนะนำธุรกิจ (ภาษาอังกฤษตามที่วิชากำหนด)
{
  const s = content("Business introduction", "แนะนำธุรกิจ");
  panel(s, M - 0.2, 3.15, 6.25, 3.8);
  panel(s, 7.2, TOP - 0.1, W - 7.2 - M + 0.2, BOTTOM - TOP + 0.1);
  txt(s, "One owner handles\nevery order by hand.", { x: M, y: TOP + 0.1, w: 6.2, h: 1.3, fontSize: 32, bold: true, lineSpacingMultiple: 1.0 });
  const facts = [["Market", "Rakuten Ichiba, Japan"], ["Products", "Fishing lures, outdoor goods, Thai herbal inhalers"],
    ["Since", "2009, started as a side business"], ["Logistics", "Rakuten Super Logistics (RSL) stores and ships"], ["Next", "Yahoo! Auctions and Amazon"]];
  facts.forEach(([k, v], i) => {
    txt(s, k, { x: M, y: 3.35 + i * 0.68, w: 1.5, h: 0.6, fontSize: 13, bold: true, color: BRAND });
    txt(s, v, { x: M + 1.55, y: 3.35 + i * 0.68, w: 4.7, h: 0.6, fontSize: 15 });
  });
  // เส้นทางของ 1 Order ขั้นที่ทำด้วยมือเป็นสีส้ม
  const flow = [["Customer orders on Rakuten Ichiba", false], ["Owner checks stock in two warehouses", true], ["Owner matches the order with RSL", true],
    ["Owner formats and prints the label", true], ["RSL packs, delivery company ships", false], ["Owner sends the tracking number", true]];
  label(s, "One order today", 7.4, TOP + 0.1, 5, SUBTLE);
  flow.forEach(([t, manual], i) => {
    const y = TOP + 0.55 + i * 0.82;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.4, y, w: 5.3, h: 0.6, rectRadius: 0.08, fill: { color: manual ? DANGER_BG : SUNKEN }, line: { color: manual ? DANGER_BG : BORDER, width: 0.75 } });
    txt(s, t, { x: 7.6, y, w: 4.2, h: 0.6, fontSize: 14, bold: manual, color: TEXT, valign: "middle" });
    if (manual) txt(s, "by hand", { x: 11.5, y, w: 1.05, h: 0.6, fontSize: 12, bold: true, color: DANGER, align: "right", valign: "middle" });
    if (i < flow.length - 1) s.addShape(pres.shapes.LINE, { x: 8.0, y: y + 0.6, w: 0, h: 0.22, line: { color: BORDER, width: 1.25, endArrowType: "triangle" } });
  });
  notes(s, 0, "Colorado Company Limited sells imported and OEM products on Rakuten Ichiba in Japan, such as fishing lures, outdoor goods and Thai herbal inhalers. The business started in 2009 as a side business and is run by one owner. Rakuten Super Logistics, or RSL, keeps most of the stock and ships the parcels; the company also keeps a small in-house warehouse. On the right is one order today. Every orange step is done by hand: checking stock in two warehouses, matching the order with RSL, formatting the label and sending the tracking number. Our system automates these repetitive steps, but the owner still approves every decision that spends money.");
}

// 4 ปัญหาพร้อมตัวเลข
{
  const s = content("Problems", "งานมือที่เกิดซ้ำทุก Order");
  panel(s, M - 0.2, TOP - 0.15, 7.75, 5.6);
  panel(s, 8.75, TOP - 0.15, W - M - 8.55, 5.6, "tint");
  const rows = [["ตรวจคำสั่งซื้อใหม่", 2], ["เช็กสต๊อก 2 คลัง", 3], ["จับคู่กับเลข RSL", 2], ["จัดรูปแบบและพิมพ์ใบปะ", 3], ["แจ้งเลขติดตาม", 2]];
  label(s, "นาทีต่อ 1 Order (ตารางที่ 1-1)", M, TOP + 0.05, 6);
  rows.forEach(([t, m], i) => {
    const y = TOP + 0.55 + i * 0.78;
    txt(s, t, { x: M, y, w: 3.0, h: 0.5, fontSize: 16, valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x: M + 3.1, y: y + 0.1, w: m * 1.05, h: 0.3, fill: { color: BRAND }, line: { color: BRAND } });
    txt(s, `${m} นาที`, { x: M + 3.2 + m * 1.05, y, w: 1.2, h: 0.5, fontSize: 15, bold: true, valign: "middle" });
  });
  s.addShape(pres.shapes.LINE, { x: M, y: TOP + 4.5, w: 7.3, h: 0, line: { color: BORDER, width: 0.75 } });
  txt(s, [{ text: "รวม 12 นาที/Order", options: { bold: true } }, { text: "   ×  5–10 Order ต่อวัน = 60–120 นาที", options: { color: SUBTLE } }], { x: M, y: TOP + 4.6, w: 7.3, h: 0.45, fontSize: 17 });
  txt(s, "ค่าประมาณจากขั้นตอนที่เจ้าของเล่า ยังไม่ได้จับเวลาจริง", { x: M, y: TOP + 5.1, w: 7.3, h: 0.3, fontSize: 12, color: SUBTLEST });
  stat(s, 8.95, TOP, 3.8, "1–2 ชม./วัน", "งานมือหลังบ้าน (ประมาณ) ≈ 30–60 ชม./เดือน");
  stat(s, 8.95, TOP + 1.8, 3.8, "400 ¥", "ส่งเองแพงกว่าคู่แข่งต่อชิ้น (600 ¥ เทียบ 200 ¥)", DANGER);
  stat(s, 8.95, TOP + 3.6, 3.8, "20–30 นาที", "รวมต้นทุน 8 รายการเองเพื่อหาต้นทุนจริง 1 SKU", DANGER);
  notes(s, 0, "ร้านขาย 5 ถึง 10 ชิ้นต่อวัน ทุก Orderผ่าน 5 งานมือ รวมประมาณ 12 นาทีต่อ Order หรือ 60 ถึง 120 นาทีต่อวัน ตัวเลขนี้เป็นค่าประมาณจากที่เจ้าของเล่า ไม่ได้จับเวลาจริง นอกจากเวลาแล้ว ค่าส่งเองแพงกว่าคู่แข่งประมาณ 400 เยนต่อชิ้น และการหาต้นทุนจริงของ 1 SKU ต้องรวม 8 รายการเอง ใช้เวลาประมาณ 20 ถึง 30 นาที การตัดสินใจสั่งซื้อเติมจึงใช้ความรู้สึก");
}

// 5 วัตถุประสงค์ + ตัวชี้วัด
{
  const s = content("Objectives", "ระบบอัตโนมัติ 3 เรื่อง และตัวชี้วัด");
  [["01", "Auto label", "จัดรูปแบบใบปะทันทีเมื่อรู้แหล่งส่ง\nเจ้าของเหลือแค่กดพิมพ์", "3S · 1S · 6S · 9A"],
   ["02", "Auto reorder", "เช็กสต๊อก 2 คลัง แจ้ง Order ที่ของไม่พอ\nเตรียมใบสั่งซื้อให้เจ้าของอนุมัติ", "3S · 5A · 6A"],
   ["03", "Unit cost", "คำนวณต้นทุนต่อหน่วยจาก 8 รายการ\nสูตรเดียวกันทุกครั้ง พร้อมเก็บประวัติ", "4S"]].forEach(([n, h, d, uc], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP - 0.15, 3.95, 2.95);
    txt(s, n, { x, y: TOP, w: 3.7, h: 0.7, fontSize: 36, bold: true, color: BRAND });
    txt(s, h, { x, y: TOP + 0.8, w: 3.7, h: 0.5, fontSize: 22, bold: true });
    txt(s, d, { x, y: TOP + 1.4, w: 3.7, h: 0.9, fontSize: 15, color: SUBTLE, lineSpacingMultiple: 1.1 });
    pill(s, "Use Case " + uc, x, TOP + 2.35);
  });
  panel(s, M - 0.2, 4.6, W - 2 * M + 0.4, 2.25, "tint");
  label(s, "ตัวชี้วัดภายใน 3 เดือนหลังเปิดใช้ (1.3)", M + 0.3, 4.8, 8, BRAND);
  [["ทุก Order ใหม่", "ได้ใบปะถูกต้องโดยไม่จัดรูปแบบเอง"], ["ทุก SKU", "ที่สต๊อกต่ำกว่าเกณฑ์ถูกแจ้งเตือน"],
   ["≤ 1 นาที", "คำนวณต้นทุนต่อหน่วย\n(เดิม 20–30 นาที)"], ["≥ 50%", "เวลางานหลังบ้านต่อวันลดลง"]].forEach(([b, d], i) => {
    const x = M + 0.3 + i * 3.0;
    txt(s, b, { x, y: 5.2, w: 2.8, h: 0.55, fontSize: 22, bold: true, color: TEXT });
    txt(s, d, { x, y: 5.8, w: 2.75, h: 0.8, fontSize: 13.5, color: SUBTLE });
  });
  notes(s, 0, "วัตถุประสงค์คือระบบอัตโนมัติ 3 เรื่อง ใบปะสินค้า การสั่งซื้อเติม และต้นทุนต่อหน่วย แต่ละเรื่องผูกกับ Use Case ที่เขียนกำกับไว้ ตัวชี้วัดภายใน 3 เดือนหลังเปิดใช้ มี 4 ข้อ ทุก Order ได้ใบปะโดยไม่จัดรูปแบบเอง ทุก SKU ที่ต่ำกว่าเกณฑ์ถูกแจ้ง คำนวณต้นทุนไม่เกิน 1 นาที และเวลางานหลังบ้านลดลงอย่างน้อยครึ่งหนึ่ง ทุกข้อวัดได้จากข้อมูลในระบบ");
}

// 6 ขอบเขต + human-in-the-loop
{
  const s = content("Scope", "เฟส 1 และสิ่งที่ยังให้คนตัดสินใจ");
  panel(s, M - 0.2, TOP - 0.15, 6.0, BOTTOM - TOP + 0.15);
  panel(s, 6.6, TOP - 0.15, W - M - 6.4, BOTTOM - TOP + 0.15, "tint");
  label(s, "อยู่ในเฟส 1", M, TOP, 5, BRAND);
  txt(s, ["Rakuten Ichiba, Rakuten RMS และ RSL เท่านั้น", "คลัง 2 แห่ง: RSL และคลังของบริษัท", "ผู้ใช้หลักคือเจ้าของ (Super Admin)", "ต่อระบบภายนอกผ่านตัวเชื่อม (adapter) ตอนนี้เป็นตัวจำลอง"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
    { x: M, y: TOP + 0.4, w: 5.6, h: 2.0, fontSize: 15, lineSpacingMultiple: 1.25 });
  label(s, "นอกขอบเขต", M, TOP + 2.65, 5, DANGER);
  txt(s, ["Yahoo! Auctions, Amazon (เฟสถัดไป)", "รับชำระเงิน และสื่อสารกับลูกค้าโดยตรง", "ยืนยันตัวตน 2 ชั้น (2FA) ของบัญชี Admin", "Mercari Shops (เลิกใช้แล้ว)"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })),
    { x: M, y: TOP + 3.05, w: 5.6, h: 2.0, fontSize: 15, lineSpacingMultiple: 1.25 });
  label(s, "Human-in-the-loop: คนตัดสินใจขั้นสำคัญ", 6.85, TOP, 5.7, DANGER);
  txt(s, "ระบบทำงานซ้ำให้\nแต่ขั้นที่ใช้เงินจริง เจ้าของต้องกดเอง", { x: 6.85, y: TOP + 0.4, w: 5.7, h: 0.9, fontSize: 20, bold: true });
  points(s, [["5A ตัดสินใจคุ้มค่าหรือไม่", "ระบบแสดงต้นทุนล่าสุดและราคาขาย แต่ไม่ตัดสินใจแทน"], ["6A ส่งใบสั่งซื้อและรับสินค้า", "เจ้าของยืนยันการสั่งซื้อ และกดรับของเมื่อ Supplier ส่งมาถึง"],
    ["7A, 10A ยกเลิกและลบข้อมูล", "ต้องใส่เหตุผล และเก็บสำเนาข้อมูล (snapshot) ก่อนลบเสมอ"]], 6.85, TOP + 1.5, 5.7, { mark: DANGER, gap: 1.2, size: 16, small: 13.5 });
  notes(s, 0, "ขอบเขตเฟส 1 คือ Rakuten Ichiba, RMS และ RSL เท่านั้น ระบบภายนอกต่อผ่าน adapter ซึ่งตอนนี้เป็นตัวจำลอง ส่วน Amazon, Yahoo และการชำระเงินอยู่นอกขอบเขต หลักการออกแบบสำคัญคือ human-in-the-loop ระบบทำงานซ้ำให้ แต่ทุกขั้นที่ใช้เงินจริง คือ 5A ตัดสินใจ และ 6A สั่งซื้อและรับของ เจ้าของต้องกดเอง ตามคำแนะนำของอาจารย์");
}

// 7 BP As-Is
{
  const s = content("Business process: As-Is", "Super Admin ทำทุกขั้นเอง");
  const { x, w } = figure(s, BP("2.1-business-process-as-is.png"), 6.4);
  label(s, "15 ขั้นตอน (2.2.1–2.2.15)", x, TOP, w, BRAND);
  points(s, [["รับ Order และตรวจเอง", "ลูกค้าสั่งผ่าน Marketplace\nSuper Admin ตรวจเลข Order ทีละรายการ"], ["เช็กสต๊อกและจับคู่ RSL เอง", "ถ้าพอ จับคู่เลข RSL พิมพ์ Label\nส่งมอบ Delivery แล้วแจ้งเลขติดตาม"],
    ["สต๊อกไม่พอ คำนวณต้นทุนเอง", "คุ้มค่า → สั่ง Supplier\nไม่คุ้มค่า หรือ Supplier ไม่มีของ → ยกเลิก Order"], ["Supplier ส่งของ วนกลับไปจับคู่ RSL", "เติมสต๊อก แล้วเริ่มจับคู่ใหม่"]], x, TOP + 0.45, w, { mark: BRAND, gap: 1.2, size: 16, small: 13 });
  notes(s, 0, "Business Process เดิมมี 15 ขั้น อ่านจากบนลงล่าง ซ้ายไปขวา Super Admin ทำเองทุกขั้น รับ Order ตรวจ เช็กสต๊อก จับคู่ RSL พิมพ์ Label ส่งมอบขนส่ง และแจ้งเลขติดตาม ถ้าสต๊อกไม่พอต้องคำนวณต้นทุนเองว่าคุ้มค่าที่จะสั่งเพิ่มหรือไม่ ถ้าคุ้มสั่ง Supplier ถ้าไม่คุ้มหรือ Supplier ไม่มีของ ยกเลิก Order");
}

// 8 Pain points
{
  const s = content("Pain points", "4 จุดที่ระบบใหม่ต้องแก้");
  const { x, w } = figure(s, BP("2.3-business-process-pain-points.png"), 6.4);
  points(s, [["จับคู่ Order กับสต๊อกเอง", "ประมาณ 5 นาที/Order หรือ 25–50 นาที/วัน (2.3.1)"], ["คำนวณความคุ้มค่าเอง", "รวม 8 รายการ ประมาณ 20–30 นาที/ครั้ง (2.3.2)"],
    ["จัดรูปแบบใบปะเอง", "ประมาณ 3 นาที/Order หรือ 15–30 นาที/วัน (2.3.3)"], ["ติดตามพัสดุและแจ้งลูกค้าเอง", "ประมาณ 2 นาที/Order หรือ 10–20 นาที/วัน (2.3.4)"]], x, TOP + 0.1, w, { mark: DANGER, gap: 1.25 });
  notes(s, 0, "จุดสีแดงในรูปคือปัญหา 4 จุด ทุกจุดวัดได้เป็นเวลา จับคู่สต๊อกประมาณ 5 นาทีต่อ Order คำนวณความคุ้มค่า 20 ถึง 30 นาทีต่อครั้ง จัดรูปแบบใบปะ 3 นาที และติดตามพัสดุ 2 นาที ปัญหาไม่ได้อยู่ที่ไม่มีคอมพิวเตอร์ แต่อยู่ที่งานซ้ำที่ทำด้วยมือและไม่มีเกณฑ์ ซึ่งวัดผลได้หลังใช้ระบบ");
}

// 9 BP To-Be
{
  const s = content("Business process: To-Be", "เพิ่มช่อง (lane) ของระบบ: ระบบรับงานซ้ำ คนตัดสินใจ");
  const { x, w } = figure(s, BP("2.4-business-process-to-be.png"), 5.6);
  label(s, "ระบบทำเอง", x, TOP + 0.1, w, BRAND);
  txt(s, "จับคู่กฎ SKU · เลือกแหล่งสต๊อก · จับคู่ RSL\nคำนวณต้นทุน · จัดรูปแบบใบปะ\nแจ้งเลขติดตาม · ตัดสต๊อก", { x, y: TOP + 0.45, w, h: 1.0, fontSize: 15 });
  pill(s, "1S – 7S", x, TOP + 1.5);
  label(s, "คนยังทำ", x, TOP + 2.2, w, DANGER);
  txt(s, "นำเข้า Order · ตรวจคำสั่งซื้อ · ตั้งกฎ SKU\nอนุมัติและสั่งซื้อ · รับของ · ยกเลิก\nพิมพ์ใบปะ · ส่งมอบพัสดุ", { x, y: TOP + 2.55, w, h: 1.0, fontSize: 15 });
  pill(s, "4A 2A 3A 5A 6A 7A 8A 9A", x, TOP + 3.6, DANGER, DANGER_BG);
  label(s, "เส้นทางใหม่หลัง 3S", x, TOP + 4.25, w, SUBTLE);
  txt(s, "RSL พอ → 1S  ·  คลังบริษัทพอ → 6S ทันที  ·  ไม่มีแหล่งใดพอ → 4S/5A", { x, y: TOP + 4.6, w, h: 0.7, fontSize: 13.5, color: SUBTLE });
  notes(s, 0, "Business Process ใหม่แยก lane ระบบออกมา ระบบรับงานซ้ำ 7 Use Case ส่วน Super Admin ยังทำขั้นที่ต้องตัดสินใจหรือใช้มือ จุดที่เพิ่มคือทางแยกหลังตรวจสต๊อก 3S ถ้า RSL พอไปจับคู่ RSL ถ้า RSL ไม่พอแต่คลังบริษัทพอ บริษัทส่งเองและไปจัดรูปแบบใบปะทันที ถ้าไม่มีแหล่งใดพอไปคำนวณต้นทุนและให้เจ้าของตัดสินใจ");
}

// 10 To-Be: ใครทำอะไร
{
  const s = content("To-Be: who does what", "16 ขั้นตอน · A = ระบบทำ · M = คนทำ · M* = ตั้งใจให้คนตัดสินใจ");
  panel(s, M - 0.2, TOP - 0.15, W - 2 * M + 0.4, BOTTOM - TOP + 0.15);
  const steps = [["1", "4A", "ดึง Order เข้าระบบ", "M", "—"], ["2", "2A", "ตรวจสอบคำสั่งซื้อ", "M", "—"], ["3", "2S", "จับคู่กฎ SKU", "A", "—"], ["4", "3A", "ตั้งกฎ SKU (ถ้าไม่พบ)", "M", "—"],
    ["5", "3S", "ตรวจสต๊อก + RSL เลือกแหล่งส่ง", "A", "2.3.1"], ["6", "1S", "จับคู่ Order กับเลข RSL", "A", "2.3.1"], ["7", "6S", "จัดรูปแบบใบปะสินค้า", "A", "2.3.3"], ["8", "9A", "พิมพ์ใบปะสินค้า", "M", "2.3.3"],
    ["9", "8A", "ส่งมอบพัสดุให้ Delivery", "M", "—"], ["10", "5S", "ส่งเลขติดตามผ่าน Marketplace", "A", "2.3.4"], ["11", "7S", "ตัดสต๊อก + อัปเดต Rakuten", "A", "2.3.4"], ["12", "4S", "คำนวณต้นทุน (Cost)", "A", "2.3.2"],
    ["13", "5A", "ตัดสินใจสั่งซื้อเพิ่ม", "M*", "2.3.2"], ["14", "6A", "สั่งซื้อจาก Supplier และรับของ", "M", "—"], ["15", "7A", "ยกเลิก Order", "M", "—"], ["16", "10A", "ลบข้อมูลเก่า", "M", "ข้อมูลเก่า"]];
  const head = ["#", "UC", "ขั้นตอน", "ผู้ทำ", "แก้ปัญหา"], cols = [0.45, 0.65, 3.35, 0.75, 0.85];
  [steps.slice(0, 8), steps.slice(8)].forEach((part, k) => {
    grid(s, [head, ...part], M + k * 6.15, TOP - 0.05, cols, (BOTTOM - TOP - 0.1) / 9, { size: 13.5, boldCol: 1,
      style: (r, i, j) => (i && j === 3 ? { bold: true, color: r[3] === "A" ? BRAND : DANGER } : {}) });
  });
  notes(s, 0, "ตารางนี้คือ 2.5 ทั้ง 16 ขั้นของ Business Process ใหม่ คอลัมน์ผู้ทำ A คือระบบทำเอง M คือคนทำ คอลัมน์ขวาบอกว่าขั้นนั้นแก้ปัญหาข้อไหนใน 2.3 ขั้นที่ 13 คือ 5A เป็น manual โดยตั้งใจ เพราะผูกกับเงินจริง ขั้นที่ 16 คือ 10A ลบข้อมูลเก่าที่เพิ่มตามคำแนะนำของอาจารย์");
}

// 11 BP ที่สัมพันธ์กับ Use Case
{
  const s = content("Business process to use case", "แต่ละกล่องใน Business Process กลายเป็น Use Case");
  const r = img(s, BP("2.6-business-process-rel-use-case.png"), M, TOP - 0.05, 5.6, BOTTOM - TOP - 0.05, { align: "l", card: true });
  const x = r.x + r.w + 0.6;
  panel(s, x - 0.2, TOP - 0.15, W - M - x + 0.4, BOTTOM - TOP + 0.15);
  const map = [["ดึง Order เข้าระบบ", "4A"], ["ตรวจสอบคำสั่งซื้อ", "2A"], ["มีกฎ SKU ไหม / ตั้งกฎ SKU", "2S · 3A"], ["ตรวจสต๊อก + RSL", "3S"], ["จับคู่ Order กับเลข RSL", "1S"],
    ["จัดรูปแบบ / พิมพ์ใบปะ", "6S · 9A"], ["ส่งมอบ / แจ้งเลขติดตาม", "8A · 5S"], ["ตัดสต๊อก", "7S"], ["คำนวณต้นทุน (Cost)", "4S"], ["ตัดสินใจ / สั่งซื้อเพิ่ม", "5A · 6A"], ["ยกเลิก Order", "7A"]];
  const w = W - M - x, rh = (BOTTOM - TOP - 1.2) / map.length;
  label(s, "Business Process", x, TOP - 0.05, w - 1.4);
  label(s, "Use Case", x + w - 1.4, TOP - 0.05, 1.4);
  map.forEach(([a, b], i) => {
    const y = TOP + 0.35 + i * rh;
    s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: BORDER, width: 0.5 } });
    txt(s, a, { x, y, w: w - 1.4, h: rh, fontSize: 14, valign: "middle" });
    txt(s, b, { x: x + w - 1.4, y, w: 1.4, h: rh, fontSize: 14, bold: true, color: BRAND, valign: "middle" });
  });
  txt(s, "ไม่อยู่ในกระบวนการหลัก: 1A เข้าสู่ระบบ (ต้องทำก่อนทุกขั้น)\nและ 10A ลบข้อมูลเก่า (งานดูแลระบบ)", { x, y: BOTTOM - 0.75, w, h: 0.65, fontSize: 13, color: SUBTLE });
  notes(s, 0, "รูปนี้คือ Business Process To-Be ที่กำกับเลข Use Case ไว้บนทุกกล่อง ทั้ง Use Case ที่คนทำและระบบทำ ทางขวาคือตารางจับคู่ BP กับ Use Case ทุก Use Case มาจาก BP ยกเว้น 1A เข้าสู่ระบบซึ่งเป็น precondition และ 10A ลบข้อมูลเก่าที่เป็นงานดูแลระบบ");
}

// 12 Use Case ก่อนปรับปรุง + CRUD As-Is
{
  const s = content("Use case diagram: before", "9 Use Case จากขั้นตอนเดิม แล้วหาสิ่งที่ขาดด้วย CRUD");
  const r = img(s, BP("2.8-use-case-diagram-as-is.png"), M, TOP - 0.05, 3.9, BOTTOM - TOP - 0.05, { align: "l", card: true });
  const x = r.x + r.w + 0.6, w = W - M - x;
  panel(s, x - 0.25, TOP - 0.15, w + 0.45, BOTTOM - TOP + 0.15, "tint");
  label(s, "CRUD ก่อนปรับปรุงชี้ว่าขาดอะไร (2.10)", x, TOP, w, DANGER);
  points(s, [["ไม่มีกฎ SKU", "เพิ่ม 3A ตั้งกฎ SKU และ 2S จับคู่กฎ SKU"], ["ไม่มีขั้นตรวจ Order ก่อนเข้ากระบวนการ", "เพิ่ม 2A ตรวจสอบคำสั่งซื้อ"],
    ["จัดรูปแบบกับพิมพ์ใบปะปนกัน", "แยก 9A พิมพ์ใบปะ ออกจาก 6S"], ["งานหลังส่งมอบไม่มีเจ้าของ", "เพิ่ม 5S แจ้งเลขติดตาม และ 7S ตัดสต๊อก"],
    ["ไม่มี Use Case ใดลบข้อมูลเก่า", "เพิ่ม 10A ลบข้อมูลเก่า พร้อมเก็บประวัติการลบ"]], x, TOP + 0.45, w, { mark: DANGER, gap: 0.98, size: 15.5, small: 13 });
  notes(s, 0, "Use Case Diagram ก่อนปรับปรุงได้จาก Business Process เดิมตรงๆ มี 9 Use Case ผูกกับ Super Admin เกือบทั้งหมด เมื่อทำ CRUD Table ก่อนปรับปรุง พบช่องว่าง 5 เรื่อง ไม่มีกฎ SKU ไม่มีการตรวจ Order การจัดรูปแบบกับพิมพ์ใบปะปนกัน งานหลังส่งมอบไม่มีเจ้าของ และไม่มีใครลบข้อมูลเก่า จึงเพิ่ม Use Case ตามที่เห็นทางขวา");
}

// 13 Use Case ที่ทบทวนแล้ว
{
  const s = content("Use case diagram: reviewed", `${UCS.length} Use Case หลังทบทวนด้วย CRUD`);
  const { x, w } = figure(s, BP("2.11-use-case-diagram-to-be.png"), 5.0);
  const added = UCS.filter((u) => u.origin === "เพิ่มใหม่");
  label(s, `เพิ่มใหม่ ${added.length} Use Case`, x, TOP, w, DANGER);
  added.forEach((u, i) => {
    txt(s, u.id, { x, y: TOP + 0.4 + i * 0.45, w: 0.7, h: 0.42, fontSize: 16, bold: true, color: u.id.endsWith("S") ? BRAND : DANGER });
    txt(s, u.name.replace(/ \(.*\)$/, ""), { x: x + 0.75, y: TOP + 0.4 + i * 0.45, w: w - 0.75, h: 0.42, fontSize: 14 });
  });
  const y0 = TOP + 0.5 + added.length * 0.45;
  label(s, "Actor", x, y0, w, BRAND);
  txt(s, "Super Admin เริ่ม 10 Use Case (A) · ระบบทำ 7 Use Case (S)\nภายนอก: Marketplace, Supplier, Delivery, RSL", { x, y: y0 + 0.35, w, h: 0.9, fontSize: 14 });
  txt(s, "1S, 4S, 5S มีปุ่มให้กด แต่ระบบทำทุกขั้นเอง\nจึงไม่ลากเส้นจาก Super Admin", { x, y: y0 + 1.05, w, h: 0.55, fontSize: 13, color: SUBTLE });
  notes(s, 0, `Use Case Diagram ที่ทบทวนแล้วมี ${UCS.length} Use Case เพิ่มใหม่ ${added.length} ตัว คือ ${added.map((u) => u.id).join(" ")} เลข A คือ Super Admin เป็นผู้เริ่ม 10 ตัว เลข S คือระบบทำเอง 7 ตัว actor ภายนอกมี Marketplace, Supplier, Delivery และ RSL ส่วน 1S, 4S, 5S มีปุ่มให้กด แต่ขั้นตอนทั้งหมดระบบทำ จึงไม่ลากเส้นจาก Super Admin`);
}

// 14 CRUD Table ที่ทบทวนแล้ว
{
  const s = content("CRUD table", `${UCS.length} Use Case × ${N_TABLES} ตาราง (entity) · แถวสีแดงคือ Use Case ที่เพิ่ม`);
  // ชื่อย่อเฉพาะบนสไลด์ ให้อยู่ในบรรทัดเดียว
  const SHORT = { "5A": "ตัดสินใจสั่งซื้อเพิ่ม", "6A": "สั่งซื้อและรับของจาก Supplier", "8A": "ส่งมอบพัสดุให้ Delivery", "3S": "ตรวจสต๊อก + RSL",
    "4S": "คำนวณต้นทุน สั่งเติมสต๊อก", "5S": "แจ้งเลขติดตามผ่าน Marketplace", "10A": "ลบข้อมูลเก่า" };
  const ents = CRUD.tables, ucs = Object.entries(CRUD.crud), added = new Set(UCS.filter((u) => u.origin === "เพิ่มใหม่").map((u) => u.id));
  const x0 = M, nameW = 3.4, cw = (W - 2 * M - nameW) / ents.length, hy = TOP - 0.15, hh = 1.75, rh = (BOTTOM - hy - hh) / ucs.length;
  panel(s, M - 0.2, hy - 0.1, W - 2 * M + 0.4, BOTTOM - hy + 0.15);
  ents.forEach((e, j) => txt(s, e, { x: x0 + nameW + j * cw + cw / 2 - hh / 2, y: hy + hh / 2 - cw / 2, w: hh, h: cw, fontFace: MONO, fontSize: 10.5, color: SUBTLE, rotate: 270, valign: "middle", align: "left" }));
  ucs.forEach(([id, { name, cells }], i) => {
    const y = hy + hh + i * rh;
    if (added.has(id)) s.addShape(pres.shapes.RECTANGLE, { x: x0, y, w: W - 2 * M, h: rh, fill: { color: DANGER_BG }, line: { color: DANGER_BG } });
    s.addShape(pres.shapes.LINE, { x: x0, y, w: W - 2 * M, h: 0, line: { color: BORDER, width: 0.5 } });
    txt(s, [{ text: id + "  ", options: { bold: true, color: id.endsWith("S") ? BRAND : TEXT } }, { text: SHORT[id] || name.replace(/ \(.*\)$/, "") }], { x: x0 + 0.05, y, w: nameW - 0.1, h: rh, fontSize: 12, valign: "middle" });
    ents.forEach((e, j) => cells[e] && txt(s, cells[e], { x: x0 + nameW + j * cw, y, w: cw, h: rh, fontSize: 11.5, bold: true, align: "center", valign: "middle", color: cells[e].includes("D") ? DANGER : TEXT }));
  });
  notes(s, 0, `CRUD Table ที่ทบทวนแล้วสร้างจากคำสั่ง SQL ทุกข้อใน Use Case Description INSERT SELECT UPDATE DELETE กลายเป็น C R U D จึงมี ${N_TABLES} entity ตรงกับตารางในฐานข้อมูลจริงและ ER Diagram ทุกตัว แถวสีแดงคือ Use Case ที่เพิ่มหลังวิเคราะห์ ตัว D สีแดงเกือบทั้งหมดอยู่ที่ 10A ซึ่งเป็น Use Case หลักที่ลบข้อมูลเก่า ต่อไปขอส่งให้อชิระเล่าแต่ละ Use Case ครับ`);
}

// ================================================================ อชิระ สไลด์ 15–33

// 15 Use Case ทั้ง 17 ในหน้าเดียว
{
  const s = content("17 use cases", "ใครเริ่ม ทำงานตอนไหน มีกี่ query");
  const TRIG = { "1A": "Admin กรอกอีเมล/รหัสผ่าน", "2A": "Admin ยืนยัน/แก้ Order", "3A": "Admin บันทึก/นำเข้าสินค้า", "4A": "Admin กดนำเข้า Order", "5A": "Admin กดคุ้มค่า/ไม่คุ้มค่า",
    "6A": "Admin ส่งใบสั่งซื้อ / รับของ", "7A": "Admin ใส่เหตุผลแล้วยกเลิก", "8A": "Admin ส่งมอบ / เปิดหน้าจัดส่ง", "9A": "Admin กดพิมพ์", "10A": "Admin เลือกข้อมูลที่จะลบ",
    "1S": "Admin กดจับคู่ RSL", "2S": "ต่อจาก 2A / 3A", "3S": "ต่อจาก 2S / รับของ 6A", "4S": "Admin กดคำนวณ / บันทึก 3A", "5S": "Admin กดส่งเลขติดตาม", "6S": "ต่อจาก 1S หรือ 3S", "7S": "ต่อจาก 5S / รอบลองใหม่" };
  const NAME = { "10A": "ลบข้อมูลเก่าที่ไม่ใช้แล้ว", "5S": "ส่งเลขติดตามผ่าน Marketplace", "4S": "คำนวณต้นทุน สั่งเติมสต๊อก", "5A": "ตัดสินใจสั่งซื้อเพิ่ม", "6A": "สั่งซื้อจาก Supplier + รับของ", "8A": "จัดส่งผ่าน Delivery", "3S": "ตรวจสต๊อก + RSL" };
  const row = (u) => [u.id, NAME[u.id] || u.name, TRIG[u.id], String(QCOUNT(u.id))];
  const A = UCS.filter((u) => u.id.endsWith("A")), S = UCS.filter((u) => u.id.endsWith("S"));
  const cols = [0.6, 2.55, 2.4, 0.4], rh = (BOTTOM - TOP - 0.05) / 11;
  panel(s, M - 0.2, TOP - 0.15, 6.15, BOTTOM - TOP + 0.15);
  panel(s, 6.75, TOP - 0.15, W - M - 6.55, BOTTOM - TOP + 0.15);
  grid(s, [["UC", "Admin เริ่ม (A)", "เริ่มเมื่อ", "Q"], ...A.map(row)], M, TOP - 0.05, cols, rh, { size: 12.5, boldCol: 0 });
  grid(s, [["UC", "ระบบทำ (S)", "เริ่มเมื่อ", "Q"], ...S.map(row)], 6.95, TOP - 0.05, cols, rh, { size: 12.5, boldCol: 0, style: (r, i, j) => (i && j === 0 ? { color: BRAND } : {}) });
  txt(s, [{ text: `รวม ${RESULTS.length} query  `, options: { bold: true } }, { text: "ชื่อ = Q + Use Case + ลำดับขั้น เช่น Q3S.1", options: { color: SUBTLE } }], { x: 6.95, y: TOP - 0.05 + 8 * rh + 0.2, w: 5.8, h: 0.5, fontSize: 14 });
  txt(s, "ในเล่ม 2.13 ทุก Use Case มี\nDescription + Sequence + Collaboration เรียงติดกัน", { x: 6.95, y: TOP - 0.05 + 9 * rh + 0.15, w: 5.8, h: 0.7, fontSize: 13, color: SUBTLE });
  notes(s, 1, `ขอบคุณครับ ผมจะเล่า Use Case ทั้ง ${UCS.length} ตัว ทางซ้ายคือ 10 ตัวที่ Super Admin เริ่ม ทางขวาคือ 7 ตัวที่ระบบทำ คอลัมน์ เริ่มเมื่อ บอกว่าในเว็บจริงทำงานตอนไหน เช่น 2S ทำต่อจาก 2A ทันที 7S ทำต่อจาก 5S คอลัมน์ Q คือจำนวน query ของ Use Case นั้น รวม ${RESULTS.length} query ในเล่มทุก Use Case มี Description ตามด้วย Sequence และ Collaboration ทันที`);
}

// 16 Order หนึ่งรายการเดินทางอย่างไร
{
  const s = content("One order, end to end", "Use Case ต่อกันอย่างไร และสถานะหลังแต่ละขั้น");
  panel(s, M - 0.2, TOP - 0.15, W - 2 * M + 0.4, BOTTOM - TOP + 0.15);
  const row1 = [["4A", "รอตรวจสอบคำสั่งซื้อ", ""], ["2A", "รอจับคู่กฎ SKU", ""], ["2S", "รอตรวจสอบสต๊อก", "auto"], ["3S", "ยังไม่ได้จับคู่ (RSL)", "auto"], ["1S", "รอจัดรูปแบบใบปะสินค้า", "auto"]];
  const row2 = [["6S", "รอพิมพ์ใบปะสินค้า", "auto"], ["9A", "พิมพ์ใบปะสินค้าแล้ว", ""], ["8A", "อยู่ระหว่างจัดส่ง", ""], ["5S", "แจ้งเลขติดตามแล้ว", "auto"], ["7S + 8A", "จัดส่งสำเร็จ", "ok"]];
  const cw = 2.0, gap = 0.45;
  [row1, row2].forEach((row, r) => {
    const y = TOP + 0.15 + r * 1.75;
    row.forEach(([id, st, k], i) => {
      const x = M + 0.1 + i * (cw + gap);
      chip(s, id, x, y, cw, 0.6, k);
      txt(s, st, { x: x - 0.1, y: y + 0.68, w: cw + 0.2, h: 0.5, fontSize: 12.5, color: SUBTLE, align: "center" });
      if (i < row.length - 1) arrow(s, x + cw + 0.05, y + 0.3, gap - 0.1);
    });
  });
  // 1S → 6S ขึ้นบรรทัดใหม่
  s.addShape(pres.shapes.LINE, { x: M + 0.1 + 4 * (cw + gap) + cw / 2, y: TOP + 1.3, w: 0, h: 0.35, line: { color: SUBTLEST, width: 1.25 } });
  s.addShape(pres.shapes.LINE, { x: M + 0.1 + cw / 2, y: TOP + 1.65, w: 4 * (cw + gap), h: 0, line: { color: SUBTLEST, width: 1.25 } });
  arrow(s, M + 0.1 + cw / 2, TOP + 1.65, 0, 0.25);
  const y3 = TOP + 3.4;
  label(s, "ทางแยกที่ 3S", M, y3, 4, BRAND);
  points(s, [["คลังบริษัทพอ (RSL ไม่พอ)", "ข้าม 1S ไป 6S ทันที ใช้ใบปะแบบบริษัทส่งเอง"], ["ไม่มีแหล่งใดพอ", "รอ Admin ตัดสินใจสั่งซื้อ → 5A → 6A → รับของ → 3S ใหม่"]], M, y3 + 0.4, 5.8, { mark: BRAND, gap: 0.85, size: 15, small: 13 });
  label(s, "เมื่อไรจึง 'จัดส่งสำเร็จ'", 6.9, y3, 5.5, SUCCESS);
  txt(s, ["ขนส่งแจ้งว่าส่งถึงแล้ว (delivered)", "แจ้งเลขติดตามแล้ว", "ตัดสต๊อกครบทุกรายการ"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x: 6.9, y: y3 + 0.4, w: 5.8, h: 0.85, fontSize: 14.5 });
  txt(s, "ต้องครบทั้ง 3 ข้อ (ตรวจใน Q7S.7, Q5S.4, Q8A.4)", { x: 6.9, y: y3 + 1.27, w: 5.8, h: 0.3, fontSize: 12.5, color: SUBTLE });
  txt(s, "สีฟ้า = ระบบทำต่อเองทันที ในงานเดียวกับปุ่มที่ Admin กด", { x: 6.9, y: y3 + 1.6, w: 5.8, h: 0.3, fontSize: 12.5, color: SUBTLE });
  notes(s, 1, "ก่อนลงรายละเอียด ขอให้เห็นภาพรวมของ Order หนึ่งรายการ Admin นำเข้า 4A ตรวจ 2A แล้วระบบจับคู่กฎ SKU 2S ตรวจสต๊อก 3S จับคู่ RSL 1S และจัดรูปแบบใบปะ 6S ต่อทันที Admin พิมพ์ 9A ส่งมอบ 8A ระบบแจ้งเลขติดตาม 5S และตัดสต๊อก 7S ที่ 3S มีทางแยก ถ้าคลังบริษัทพอข้าม 1S ไป 6S ถ้าไม่มีแหล่งใดพอไป 5A Order จะจัดส่งสำเร็จได้ต้องครบ 3 เงื่อนไข ขนส่งส่งถึง แจ้งเลขติดตามแล้ว และตัดสต๊อกครบทุกรายการ");
}

// 17 Sequence แบบ MVC: ชื่อ object ใน Sequence เทียบกับไฟล์จริง (stereotype ไม่ใช่คลาสใหม่)
{
  const s = content("Sequence diagram: MVC", "Actor → Screen → Controller → Model → DB · ไม่มีลูกศรกลับหา Actor");
  const cols = [
    ["Actor", "Super Admin", "คนกดหน้าเว็บ", undefined],
    ["Screen (View)", `:${PART("2A", "V")}`, "หน้าเว็บ (page.tsx)", "auto"],
    ["Controller", `:${PART("2A", "C")}`, "รับคำสั่งจากหน้าเว็บ (actions.ts)", "auto"],
    ["Model", `:${PART("2A", "UC")}\n:${PART("2A", "OQ")}`, "ขั้นตอนงาน + คำสั่ง SQL", "auto"],
    ["Database", ":DBConnector", "ตัวต่อฐานข้อมูล PostgreSQL", undefined],
  ];
  const cw = 2.1, gap = 0.41;
  panel(s, M - 0.2, TOP - 0.15, W - 2 * M + 0.4, 2.55);
  cols.forEach(([role, name, file, k], i) => {
    const x = M + i * (cw + gap);
    label(s, role, x, TOP - 0.05, cw, BRAND);
    chip(s, name, x, TOP + 0.3, cw, 0.95, k);
    txt(s, file, { x, y: TOP + 1.35, w: cw, h: 0.6, fontSize: 12.5, color: SUBTLE, align: "center" });
    if (i < cols.length - 1) arrow(s, x + cw + 0.04, TOP + 0.78, gap - 0.08);
  });
  txt(s, "ตัวอย่างจาก Sequence ของ 2A ชื่อทุกตัวตรงกับรูปในเล่ม", { x: M, y: TOP + 1.95, w: W - 2 * M, h: 0.35, fontSize: 12.5, color: SUBTLEST });
  const y = TOP + 2.65, cwL = 6.6;
  panel(s, M - 0.2, y - 0.1, cwL + 0.4, BOTTOM - y + 0.1);
  label(s, "ลำดับ message (ย่อ) · ->> = เรียก  -->> = ส่งผลกลับ", M, y, cwL, BRAND);
  code(s, ["Admin      ->> Screen     : clickConfirm(order_id)", "Screen     ->> Controller : verifyOrderAction(order_id)", "Controller ->> Model      : verifyOrderUseCase(order_id)",
    "Model      ->> DB         : query(Q2A.2)", "DB        -->> Model      : return snapshot", "Model     -->> Controller : return ok", "Controller-->> Screen     : return result",
    "Screen     ->> Screen     : showSuccess()"].join("\n"), M, y + 0.35, cwL, BOTTOM - y - 0.45, 11.5);
  const x = M + cwL + 0.6, w = W - M - x;
  panel(s, x - 0.2, y - 0.1, w + 0.4, BOTTOM - y + 0.1, "tint");
  points(s, [["ไม่มีลูกศรกลับหา Actor", "Screen แสดงผลเอง (self message)"], ["Screen ไม่แตะ DB", "ทุกคำสั่งผ่าน Controller แล้ว Model"], ["ชื่อคือบทบาท ไม่ใช่คลาสใหม่", VIEW_SUFFIX === "Screen" ? "Screen คือชั้น View (เกณฑ์ห้ามใช้คำว่า view)" : "ไม่ได้เพิ่มคลาส Controller ในโค้ด"]],
    x, y + 0.05, w, { mark: BRAND, gap: 1.0, size: 15, small: 12.5 });
  notes(s, 1, `ก่อนดู Use Case ทีละตัว ขออธิบายวิธีอ่าน Sequence ในเล่ม ทุกรูปเขียนแบบ MVC ตามที่อาจารย์สอน Actor คือ Super Admin กดที่ Screen ซึ่งคือหน้าเว็บ page.tsx ชื่อ ${PART("2A", "V")} Screen ส่งคำสั่งให้ Controller คือ Server Action ในไฟล์ actions.ts Controller เรียก Model คือ UseCase และ Queries ที่เก็บ SQL แล้วเข้าฐานข้อมูลผ่าน DBConnector ตัวเดียว ผลลัพธ์ย้อนกลับเป็นเส้นประจนถึง Screen แล้ว Screen แสดงผลเองเป็น self message จึงไม่มีลูกศรกลับไปหา Actor ชื่อ Screen กับ Controller เป็นชื่อบทบาทที่จับคู่กับไฟล์จริง ในโค้ดไม่ได้สร้างคลาส Controller เพิ่ม${VIEW_SUFFIX === "Screen" ? " object ติด Actor ลงท้ายว่า Screen เพราะเกณฑ์ข้อ 24 ห้ามตั้งชื่อว่า view แต่ Screen ทำหน้าที่ View ของ MVC" : ""}`);
}

// 18 1A เข้าสู่ระบบ
{
  const s = content("1A Log in", "เข้าสู่ระบบ / ออกจากระบบ");
  panel(s, M - 0.2, TOP - 0.15, 5.6, BOTTOM - TOP + 0.15, "tint");
  meta(s, [["Actor", "Super Admin"], ["Pre", "มีบัญชีผู้ดูแล (ตาราง admins)"], ["Post", "เปิด session อายุ 8 ชม.\nแล้วไปหน้า Dashboard"]], M, TOP, 5.1, 0.6);
  label(s, "ล็อกบัญชี 15 นาที", M, TOP + 1.95, 5, DANGER);
  points(s, [["ผิดครบ 5 ครั้ง", "Q1A.3 ล็อกบัญชีไว้อีก 15 นาที"], ["ระหว่างล็อก", "ไม่ตรวจรหัสผ่าน แจ้ง \"กรุณารออีก N นาที\""], ["ครบเวลาแล้ว", "Q1A.2 ปลดล็อกเองก่อนตรวจรหัสผ่าน"],
    ["สำเร็จ", "Q1A.4 ล้างตัวนับครั้งที่ผิด, Q1A.5 บันทึก session"]], M, TOP + 2.35, 5.1, { mark: DANGER, gap: 0.75, size: 14.5, small: 12.5 });
  const x = 6.05, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15);
  label(s, "Sequence 1A · ส่วนที่ 1 (เปิดหน้า Login)", x, TOP - 0.05, w, BRAND);
  img(s, DIA("1A-sequence-1.png"), x, TOP + 0.3, w, BOTTOM - TOP - 0.4, { align: "t" });
  notes(s, 1, `1A เข้าสู่ระบบ มี ${QCOUNT("1A")} query Q1A.1 อ่านบัญชีพร้อม locked_until ถ้ารหัสผิดครบ 5 ครั้ง Q1A.3 ตั้งเวลาล็อก 15 นาที ระหว่างล็อกไม่ตรวจรหัสผ่านและบอกนาทีที่เหลือ ครบเวลาแล้ว Q1A.2 ปลดล็อกให้เอง ถ้าสำเร็จ Q1A.4 ล้างตัวนับและ Q1A.5 สร้าง session เก็บเฉพาะ hash ของ token อีเมลที่ไม่มีในระบบไม่ถูกนับ ทางขวาคือส่วนแรกของ Sequence Diagram ของ 1A ในเล่มตัดเป็น 4 ส่วนให้ตัวอักษรใหญ่ Admin กดที่ LoginScreen ส่งให้ LoginController และไม่มีเส้นกลับไปหา Actor`);
}

// 19 2A · 2S · 3A
{
  const s = content("2A · 2S · 3A", "ตรวจ Order แล้วจับคู่กฎ SKU");
  const cols3 = [
    ["2A ตรวจสอบคำสั่งซื้อ", "Admin", [["ยืนยัน หรือแก้ SKU/จำนวน", "Q2A.1 ล็อก Order กันแก้พร้อมกัน"], ["Marketplace ตอบไม่ได้", "แจ้งเตือนและคงสถานะเดิม"]], `${QCOUNT("2A")} query`],
    ["2S จับคู่กฎ SKU", "ระบบทำ", [["หา SKU จากรหัสบน Rakuten", "Q2S.2 กฎอยู่ในตารางสินค้า\nไม่มีตารางกฎแยก"], ["ไม่พบ / พบหลายกฎ", "ส่งให้คนดู: 'รอดำเนินการด้วยตนเอง'"], ["อ่านกฎไม่ได้", "Q2S.5 หยิบมาทำใหม่รอบถัดไป"]], `${QCOUNT("2S")} query`],
    ["3A ตั้งกฎ SKU", "Admin", [["เพิ่ม/แก้/นำเข้าสินค้า", "ใส่รหัสสินค้าบน Rakuten = ตั้งกฎ SKU"], ["บันทึกแล้ว", "Q3A.8 Order ที่ค้างกลับเข้าคิว\nแล้วทำ 2S → 3S → 6S ต่อทันที"]], `${QCOUNT("3A")} query`],
  ];
  cols3.forEach(([h, who, items, q], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP - 0.15, 3.95, BOTTOM - TOP + 0.15, i === 1 ? "tint" : "card");
    txt(s, h, { x, y: TOP, w: 3.6, h: 0.45, fontSize: 19, bold: true });
    const pw = pill(s, who, x, TOP + 0.55, who === "ระบบทำ" ? BRAND : DANGER, who === "ระบบทำ" ? SELECTED : DANGER_BG);
    pill(s, q, x + pw + 0.15, TOP + 0.55, SUBTLE, SUNKEN);
    points(s, items, x, TOP + 1.2, 3.6, { gap: 1.15, size: 15, small: 13 });
  });
  notes(s, 1, "กลุ่มแรกคือการรับ Order เข้ากระบวนการ 2A Admin ยืนยันหรือแก้ SKU และจำนวน Q2A.1 ล็อกแถว Order ไว้ก่อน 2S ระบบหา SKU จากคอลัมน์ channel_sku ในตาราง skus ถ้าไม่พบหรือพบหลายตัวส่งให้คนดู ถ้าอ่านข้อมูลกฎไม่ได้ จะถูกหยิบมาทำใหม่ในการทำงานรอบถัดไป 3A คือหน้าตั้งกฎ SKU เมื่อบันทึก Order ที่ค้างเพราะกฎ SKU จะกลับเข้าคิวและวิ่งต่อ 2S 3S 6S ทันทีใน transaction เดียวกัน");
}

// 20 3S ตรวจสต๊อก
{
  const s = content("3S Check stock", "เลือกแหล่งส่ง: RSL ก่อน แล้วคลังบริษัท");
  panel(s, M - 0.2, TOP - 0.15, 5.1, BOTTOM - TOP + 0.15, "tint");
  meta(s, [["Actor", "ระบบ (ทำต่อจาก 2S ทันที), RSL"], ["Pre", "Order สถานะ 'รอตรวจสอบสต๊อก'"], ["Post", "บันทึกแหล่งส่งที่เลือก\nแล้วส่งต่อขั้นถัดไป"]], M, TOP, 4.6, 0.75);
  label(s, "ขั้นตอน", M, TOP + 2.25, 4, BRAND);
  points(s, [["Q3S.1 ล็อกแถวสต๊อก", "กันสอง Order แย่งของชิ้นเดียว"], ["Q3S.2 อ่านยอด RSL", "ในงานเดียวกัน (transaction)"], ["Q3S.3 หักยอดที่ถูกจอง", "Order อื่นที่ยังไม่ตัดสต๊อก"], ["Q3S.4 บันทึกแหล่งส่ง", "ลงใน Order และรายการสินค้า"]],
    M, TOP + 2.6, 4.6, { mark: BRAND, gap: 0.72, size: 14.5, small: 12.5 });
  const x = 6.1, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15);
  label(s, "กฎเลือกแหล่ง (แต่ละแหล่งต้องพอทั้งจำนวน ไม่แบ่งส่ง)", x, TOP - 0.05, w, BRAND);
  const rules = [["RSL ว่าง ≥ จำนวนที่สั่ง", "ยังไม่ได้จับคู่ → 1S", "auto"], ["RSL ไม่พอ\nคลังบริษัทว่าง ≥ จำนวนที่สั่ง", "รอจัดรูปแบบใบปะสินค้า\n→ 6S ทันที", "auto"], ["ไม่มีแหล่งใดพอ", "รอ Admin ตัดสินใจสั่งซื้อ → 5A", "bad"]];
  rules.forEach(([c, r, k], i) => {
    const y = TOP + 0.45 + i * 1.05;
    chip(s, c, x, y, 3.1, 0.75, k);
    arrow(s, x + 3.15, y + 0.375, 0.5);
    txt(s, r, { x: x + 3.75, y, w: w - 3.75, h: 0.75, fontSize: 15, bold: true, valign: "middle" });
  });
  code(s, "ว่าง = ยอดในคลัง − ยอดที่ Order อื่นจองไว้ (Q3S.3)\nRSL ล่ม → ใช้เฉพาะคลังบริษัท และ Q3S.5 บันทึกข้อผิดพลาด", x, TOP + 3.75, w, 0.9, 12);
  txt(s, "Admin ปรับยอดสต๊อกเองได้ที่หน้าตรวจสต๊อก\n(Q3S.6–Q3S.9 เก็บประวัติการปรับทุกครั้ง)", { x, y: TOP + 4.8, w, h: 0.55, fontSize: 13, color: SUBTLE });
  notes(s, 1, `3S เป็นหัวใจของ Auto reorder มี ${QCOUNT("3S")} query ระบบล็อกแถว stock ของ SKU ก่อนด้วย Q3S.1 อ่านยอด RSL แล้วหักยอดที่ Order อื่นจองไว้แต่ยังไม่ตัดสต๊อกด้วย Q3S.3 กฎคือเลือก RSL ก่อน ถ้า RSL ว่างพอทั้งจำนวนไป 1S ถ้าไม่พอแต่คลังบริษัทพอ บริษัทส่งเองและไป 6S ทันที ถ้าไม่มีแหล่งใดพอทั้งจำนวน Order ไปรอเจ้าของตัดสินใจใน 5A เราไม่แบ่งส่งจากสองคลังเพราะจะได้พัสดุสองกล่องและค่าส่งสองครั้ง`);
}

// 21 3S Sequence
{
  const s = content("3S Sequence diagram", "ส่วนอัตโนมัติ: ล็อก → หักยอดจอง → เลือก RSL / คลังบริษัท / ไม่พอ");
  seqParts(s, "3S", [1]);
  notes(s, 1, "Sequence Diagram ของ 3S ส่วนแรก คือส่วนอัตโนมัติ เริ่มจาก ExecuteWorkflow หลัง 2S ตามโน้ตสีเหลือง หัวรูปมี Super Admin กับ StockCheckScreen เพราะส่วนที่ 2 และ 3 ในเล่มคือหน้าตรวจสต๊อกที่ Admin เปิดเองผ่าน Screen และ Controller ในส่วนนี้ ExecuteWorkflow เรียก CheckStockUseCase ซึ่งเรียก StockQueries ผ่าน DBConnector เห็นลำดับ ล็อกแถว อ่าน RSL หักยอดจอง แล้วแยก 3 ทางในกรอบ alt ทุกเส้นที่ลงฐานข้อมูลกำกับเลข query ตรงกับ Description");
}

// 22 3S Collaboration
{
  const s = content("3S Collaboration diagram", "object และ message ชุดเดียวกับ Sequence");
  const { x, w } = figure(s, DIA("3S-collaboration.png"), 7.0);
  points(s, [["แปลงจาก Sequence", "object ชุดเดียวกัน message ครบทุกเส้น"], ["เลขลำดับแทนแกนเวลา", "1, 2, 3 ... ตามลำดับใน Sequence"],
    ["[route = ...] กำกับทางเลือก", "rsl = RSL พอ\nin_house = คลังบริษัทพอ\nlow = ไม่มีแหล่งใดพอ"], ["DBConnector อยู่ล่างสุด", "Queries ทุกตัวเข้าฐานข้อมูลผ่านตัวนี้"]], x, TOP + 0.15, w, { mark: BRAND, gap: 1.25, size: 16, small: 13.5 });
  notes(s, 1, "Collaboration Diagram ของ 3S แปลงจาก Sequence object ตรงกันทุกตัว เลขลำดับ message แทนแกนเวลา ทางเลือกเขียนเงื่อนไขในวงเล็บเหลี่ยม และทุกโมดูล Queries เข้าฐานข้อมูลผ่าน DBConnector ตัวเดียว เราตรวจทั้ง 17 Use Case ด้วยสคริปต์ว่าเลข query ใน Description, Sequence และ Collaboration ตรงกัน");
}

// 23 1S · 6S · 9A ใบปะ
{
  const s = content("1S · 6S · 9A Labels", "Auto label: จับคู่ → จัดรูปแบบ → พิมพ์");
  panel(s, M - 0.2, TOP - 0.15, 6.0, BOTTOM - TOP + 0.15);
  points(s, [[`1S จับคู่ Order กับเลข RSL (${QCOUNT("1S")} query)`, "รับเฉพาะ Order ที่ส่งจาก RSL\nOrder ที่บริษัทส่งเองถูกปฏิเสธ"],
    [`6S จัดรูปแบบใบปะ (${QCOUNT("6S")} query)`, "เลือกแบบใบปะตามแหล่งส่งและวิธีส่ง\nQ6S.4 สร้างใบปะ สถานะ ready (พร้อมพิมพ์)"],
    [`9A พิมพ์ใบปะ (${QCOUNT("9A")} query)`, "Admin กดพิมพ์\nQ9A.3 บันทึกประวัติทุกครั้ง รวมพิมพ์ซ้ำ"]], M, TOP, 5.6, { mark: BRAND, gap: 1.35, size: 16, small: 13.5 });
  label(s, "แบบใบปะ (template)", M, TOP + 3.85, 5, BRAND);
  grid(s, [["แหล่งส่ง", "แบบใบปะ"], ["RSL ส่งแบบปกติ", "RSL-STD-A6"], ["RSL ส่งของใหญ่", "RSL-LARGE-A5"], ["บริษัทส่งเอง", "INHOUSE-YAMATO-A6"]], M, TOP + 4.2, [2.6, 2.9], 0.29, { size: 12.5, boldCol: 1 });
  const x = 6.6, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15, "tint");
  label(s, "ใบปะ RSL", x, TOP - 0.05, 3, BRAND);
  img(s, PLT("report/label-ORD-24178.png"), x, TOP + 0.3, w, 2.35, { align: "lt", frame: true });
  label(s, "ใบปะ บริษัทส่งเอง (ไม่มีเลข RSL)", x, TOP + 2.8, w, BRAND);
  img(s, PLT("report/label-ORD-24177.png"), x, TOP + 3.15, w, 2.15, { align: "lt", frame: true });
  notes(s, 1, "Auto label มี 3 Use Case 1S จับคู่ Order กับเลข RSL รับเฉพาะ Order ที่ 3S เลือก RSL 6S จัดรูปแบบใบปะทันทีตามแหล่งส่ง RSL ส่งปกติใช้ RSL-STD-A6 ของใหญ่ใช้ RSL-LARGE-A5 บริษัทส่งเองใช้ INHOUSE-YAMATO-A6 ไม่มีเลข RSL และใช้เลข Order กับเลขกล่องเป็นรหัสสแกน 9A Admin กดพิมพ์ ทุกการพิมพ์รวมพิมพ์ซ้ำถูกบันทึกในประวัติ การพิมพ์ยังให้คนกดเพราะเป็นงานกายภาพ");
}

// 24 4S Unit cost
{
  const s = content("4S Unit cost", "สูตรเดียวทุกครั้ง พร้อมประวัติ");
  panel(s, M - 0.2, TOP - 0.15, W - 2 * M + 0.4, 2.0);
  label(s, "สูตรต้นทุนต่อหน่วย (2.22)", M, TOP - 0.05, 6, BRAND);
  code(s, "Unit Cost = ((purchase_price × exchange_rate) + intl_freight + duty_fee) / order_qty\n            + marketplace_fee + domestic_shipping + rsl_charge", M, TOP + 0.3, W - 2 * M, 0.8, 13);
  txt(s, "ต้นทุนต่อหน่วย = ((ราคาซื้อ × อัตราแลกเปลี่ยน) + ค่าขนส่งระหว่างประเทศ + ภาษีนำเข้า) ÷ จำนวนที่สั่ง\n+ ค่าธรรมเนียม Marketplace + ค่าส่งในประเทศ + ค่า RSL", { x: M + 0.15, y: TOP + 1.15, w: W - 2 * M - 0.3, h: 0.6, fontSize: 13.5, color: SUBTLE });
  panel(s, M - 0.2, TOP + 2.05, 6.0, BOTTOM - TOP - 2.05, "tint");
  points(s, [["เริ่มเมื่อ", "Admin กดคำนวณที่หน้าต้นทุน\nหรือบันทึกสินค้าพร้อมต้นทุนใน 3A"], ["ข้อมูลไม่ครบ", "\"กรุณากรอกข้อมูลต้นทุนให้ครบถ้วนและถูกต้อง\""],
    ["บันทึก", `Q4S.5 เก็บค่าล่าสุดไว้ใช้ใน 5A\nQ4S.6 เก็บประวัติทุกครั้ง (รวม ${QCOUNT("4S")} query)`]], M, TOP + 2.25, 5.6, { mark: BRAND, gap: 1.0, size: 15, small: 13 });
  const x = 6.6, w = W - M - x;
  panel(s, x - 0.2, TOP + 2.05, w + 0.4, BOTTOM - TOP - 2.05);
  img(s, PLT("report/unit-cost-FSH-MLR-240.png"), x, TOP + 2.2, w, BOTTOM - TOP - 2.35, { align: "lt", frame: true });
  notes(s, 1, "4S คำนวณต้นทุนต่อหน่วยจาก 8 รายการด้วยสูตรเดียวกันทุกครั้ง ราคาซื้อคูณอัตราแลกเปลี่ยน บวกค่าขนส่งระหว่างประเทศและภาษี หารด้วยจำนวนที่สั่ง แล้วบวกค่าธรรมเนียม Marketplace ค่าส่งในประเทศ และค่า RSL สูตรคำนวณในโค้ด ส่วน SQL ใช้อ่านและบันทึก ทุกครั้งที่คำนวณบันทึกลง cost_history และค่าล่าสุดใน costs ถูกใช้ต่อใน 5A ทางขวาคือรายงานต้นทุนต่อหน่วยจากเว็บจริง");
}

// 25 5A ตัดสินใจ
{
  const s = content("5A Decide reorder", "ระบบเตรียมข้อมูล คนกดตัดสินใจ");
  panel(s, M - 0.2, TOP - 0.15, 4.85, BOTTOM - TOP + 0.15, "tint");
  meta(s, [["Actor", "Super Admin"], ["Pre", "Order สถานะ\n'รอ Admin ตัดสินใจสั่งซื้อ'\n(3S พบว่าสต๊อกไม่พอ)"], ["Post", "คุ้มค่า → รอสั่งซื้อจาก Supplier (6A)\nไม่คุ้มค่า → รอยกเลิก Order (7A)"]], M, TOP, 4.4, 1.25);
  label(s, "กรณีผิดพลาด", M, TOP + 3.85, 4, DANGER);
  txt(s, ["จำนวนไม่ใช่จำนวนเต็มบวก → แจ้งให้แก้", "ไม่มีราคาขาย → ลิงก์ไปตั้งราคาที่ 3A", "ถูกตัดสินใจไปแล้ว → ไม่บันทึกซ้ำ"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x: M, y: TOP + 4.2, w: 4.4, h: 1.2, fontSize: 13.5 });
  const x = 5.8, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15);
  points(s, [["Q5A.1 ล็อก Order แล้วดึงข้อมูล", "ราคาขาย + ต้นทุนล่าสุดจาก 4S + เหตุผลที่ Order ค้าง"], ["Admin กดเลือกเอง", "ปุ่ม \"คุ้มค่า - สั่งซื้อเพิ่ม\" พร้อมจำนวน หรือ \"ไม่คุ้มค่า - ยกเลิก\""]], x, TOP, w, { mark: BRAND, gap: 1.15, size: 16, small: 14 });
  label(s, "Q5A.2 บันทึกผลการตัดสินใจ", x, TOP + 2.45, w, BRAND);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: TOP + 2.8, w, h: 1.35, rectRadius: 0.06, fill: { color: SUNKEN }, line: { color: BORDER, width: 0.5 } });
  txt(s, ["ผลการตัดสินใจ: คุ้มค่า / ไม่คุ้มค่า", "จำนวนที่จะสั่ง (เฉพาะเมื่อคุ้มค่า)", "สถานะใหม่ของ Order และเวลาที่แก้"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x: x + 0.15, y: TOP + 2.8, w: w - 0.3, h: 1.35, fontSize: 14, valign: "middle" });
  label(s, "Q5A.3 ไม่มีราคาขาย", x, TOP + 4.35, w, DANGER);
  txt(s, "Order เป็น 'รอดำเนินการด้วยตนเอง' พร้อมบันทึกเหตุผลว่าไม่มีราคา", { x, y: TOP + 4.7, w, h: 0.55, fontSize: 14, valign: "middle" });
  notes(s, 1, `5A คือจุด human-in-the-loop มี ${QCOUNT("5A")} query Q5A.1 ล็อก Order และดึงราคาขายกับต้นทุนล่าสุดจาก 4S ระบบแสดงให้ดูแต่ไม่ตัดสินใจแทน เจ้าของกดคุ้มค่าพร้อมจำนวน หรือไม่คุ้มค่า Q5A.2 บันทึกผล คุ้มค่าไป 6A ไม่คุ้มค่าไป 7A ถ้าจำนวนไม่ใช่จำนวนเต็มบวกแจ้ง invalid-qty ถ้าสินค้าไม่มีราคาขาย Q5A.3 ส่งไปรอคนแก้ราคาที่ 3A`);
}

// 26 5A Sequence
{
  const s = content("5A Sequence diagram", "Screen → Controller → Model → DBConnector");
  seqParts(s, "5A", [1, 2]);
  notes(s, 1, `Sequence ของ 5A แบ่งสองท่อน ${PART("5A", "V")} คือ Screen ติดกับ Actor ส่งคำสั่งให้ ${PART("5A", "C")} คือ Server Action ใน actions.ts ต่อไปที่ ${PART("5A", "UC")} และ ${PART("5A", "RQ")} ลงฐานข้อมูลผ่าน DBConnector ทุกเส้นที่ลง DB มีเลข query ตรงกับ Description ผลลัพธ์ย้อนกลับถึง Screen แล้ว Screen แสดงผลเอง ไม่มีเส้นกลับไปหา Actor`);
}

// 27 5A Collaboration
{
  const s = content("5A Collaboration diagram", "object ชุดเดียวกับ Sequence · เลขลำดับแทนแกนเวลา");
  const { x, w } = figure(s, DIA("5A-collaboration.png"), 7.4);
  points(s, [[`:${PART("5A", "V")}`, "Screen · หน้าตัดสินใจสั่งซื้อ"], [`:${PART("5A", "C")}`, "Controller · รับคำสั่งจากหน้าจอ (actions.ts)"], [`:${PART("5A", "UC")}`, "Model · ตัดสินใจและบันทึก Q5A.1–Q5A.3"], [":DBConnector", "Database · ตัวต่อฐานข้อมูล (db.ts)"]],
    x, TOP + 0.15, w, { mark: BRAND, gap: 1.2, size: 15, small: 13 });
  notes(s, 1, "Collaboration ของ 5A ใช้ object ชุดเดียวกับ Sequence ไล่ตามบทบาท MVC Screen (ชั้น View) Controller Model และ DBConnector เลขลำดับ message แทนแกนเวลา และไม่มี message ที่ส่งกลับไปหา Actor เช่นกัน");
}

// 28 6A สั่งซื้อและรับของ
{
  const s = content("6A Reorder and receive", "ส่งใบสั่งซื้อ แล้วรับของเข้าคลังบริษัท");
  const x2 = M + 6.15;
  [[M, "ส่งใบสั่งซื้อ (Q6A.1–Q6A.9)", [["Q6A.6 ขอเลขใบสั่งซื้อ", "ระบบออกเลขถัดไปให้ เช่น PO-0092"], ["Q6A.7 สร้างใบสั่งซื้อ", "สถานะ 'รอส่งคำสั่งซื้อ'"], ["Q6A.8 ผูกทุก Order ของ SKU นี้", "ใบสั่งซื้อเดียวครอบคลุมหลาย Order"],
    ["ส่งให้ Supplier (ผ่านตัวเชื่อม)", "สำเร็จ → Q6A.9 'สั่งซื้อแล้ว'\nพร้อมวันที่คาดว่าจะได้รับ"]]],
   [x2, "รับสินค้า (Q6A.10–Q6A.14)", [["Q6A.10 ล็อกใบสั่งซื้อ + สต๊อก", "กันกดรับของพร้อมกันสองครั้ง"], ["Q6A.11 'ได้รับสินค้าแล้ว'", "เงื่อนไขสถานะทำให้รับซ้ำไม่ได้"],
    ["Q6A.12–13 เพิ่มสต๊อกคลังบริษัท", "พร้อมบันทึกประวัติการปรับสต๊อก"], ["Q6A.14 Order ที่ผูกไว้ → 'รอตรวจสอบสต๊อก'", "แล้ว 3S, 6S ทำต่อทันที"]]]].forEach(([x, h, items], i) => {
    panel(s, x - 0.2, TOP - 0.15, 5.95, 4.55, i ? "tint" : "card");
    label(s, h, x, TOP - 0.05, 5.5, BRAND);
    points(s, items, x, TOP + 0.35, 5.55, { mark: BRAND, gap: 0.98, size: 15, small: 13 });
  });
  panel(s, M - 0.2, TOP + 4.55, W - 2 * M + 0.4, BOTTOM - TOP - 4.55);
  txt(s, [{ text: "ทดสอบจริง  ", options: { bold: true, color: BRAND } }, { text: "รับ PO-0091 จำนวน 60 ชิ้น → \"เพิ่ม OUT-CHR-003 เข้าสต๊อกในบริษัท 60 ชิ้นแล้ว\" และ Order ที่ผูกไว้ 2 รายการกลับไปตรวจสต๊อก" }],
    { x: M, y: TOP + 4.55, w: W - 2 * M, h: BOTTOM - TOP - 4.55, fontSize: 14, valign: "middle" });
  notes(s, 1, `6A มี ${QCOUNT("6A")} query แบ่งสองช่วง ช่วงส่งใบสั่งซื้อ สร้าง reorders แล้วผูกทุก Order ที่รอ SKU นี้ผ่าน orders.reorder_id ใบสั่งซื้อหนึ่งใบจึงครอบคลุมหลาย Order แล้วส่งให้ Supplier ช่วงรับสินค้า Admin กดรับของ ระบบล็อกใบสั่งซื้อและแถว stock เปลี่ยนเป็นได้รับสินค้าแล้วได้ครั้งเดียว เพิ่มสต๊อกคลังบริษัทพร้อมประวัติ แล้วส่ง Order ที่ผูกไว้กลับไปตรวจสต๊อก 3S และจัดรูปแบบใบปะ 6S ต่อทันที`);
}

// 29 6A Sequence
{
  const s = content("6A Sequence diagram", "ช่วงรับสินค้า: Screen → Controller → UseCase → ExecuteWorkflow");
  seqParts(s, "6A", [4]);
  notes(s, 1, "Sequence Diagram ของ 6A ยาวที่สุดในเล่ม ตัดเป็น 5 ส่วน ส่วนแรกคือส่งใบสั่งซื้อผ่าน SupplierAdapter ส่วนที่เห็นนี้คือรับสินค้า Admin กดรับที่ ReorderScreen ส่งให้ ReorderController แล้ว UseCase วิ่งผ่าน ExecuteWorkflow เพื่อให้ 3S และ 6S ทำต่อใน transaction เดียวกัน ผลกลับมาที่ Screen และไม่มีเส้นกลับหา Actor");
}

// 30 6A Collaboration
{
  const s = content("6A Collaboration diagram", "message มีเลขลำดับ ครบทั้งส่งและรับ");
  const { x, w } = figure(s, DIA("6A-collaboration.png"), 6.4);
  points(s, [[`${PART("6A", "V")} → ${PART("6A", "C")}`, "Screen → Controller ปุ่มสั่งซื้อและรับสินค้าอยู่หน้าเดียวกัน"], ["SupplierAdapter", "ตัวเชื่อมไป Supplier ตอนนี้เป็นตัวจำลอง"], ["ExecuteWorkflow", "รับของแล้วเรียก 3S, 6S ต่อ"], ["Q6A.1–Q6A.14", "ทุกเลขตรงกับ Description"]],
    x, TOP + 0.15, w, { mark: BRAND, gap: 1.2, size: 16, small: 13.5 });
  notes(s, 1, "Collaboration ของ 6A ใช้ object ชุดเดียวกับ Sequence หน้าจอ ReorderScreen มีทั้งปุ่มสั่งซื้อและรับสินค้า ส่งคำสั่งผ่าน Controller SupplierAdapter เป็นตัวต่อ Supplier ซึ่งตอนนี้จำลอง และ ExecuteWorkflow ทำให้หลังรับของ ระบบตรวจสต๊อกและจัดรูปแบบใบปะต่อเอง");
}

// 31 8A · 5S · 7S
{
  const s = content("8A · 5S · 7S Ship and deduct", "ส่งมอบ → แจ้งเลขติดตาม → ตัดสต๊อก");
  const cols3 = [
    ["8A ส่งมอบพัสดุ", "Admin", [["Q8A.2 บันทึกเลขติดตาม", "มีเลข → 'อยู่ระหว่างจัดส่ง'\nไม่มีเลข → 'รอส่งมอบ'"], ["เปิดหน้าจัดส่ง", "ขนส่งแจ้งส่งถึง → 7S\nแล้ว Q8A.5 ปิดงาน"]], QCOUNT("8A")],
    ["5S แจ้งเลขติดตาม", "ระบบทำ", [["Q5S.2 กันส่งซ้ำ", "เช็กประวัติการแจ้งก่อนส่ง"], ["ส่งผ่านตัวเชื่อม Rakuten", "สำเร็จ → 'แจ้งเลขติดตามแล้ว'\nแล้ว 7S ทันที"]], QCOUNT("5S")],
    ["7S ตัดสต๊อก", "ระบบทำ", [["Q7S.2 ล็อกรายการ + สต๊อก", "ตัดเฉพาะรายการที่ยังไม่ตัด"], ["Q7S.6 คิวอัปเดต Rakuten", "Rakuten ล่ม: ตัดในระบบไว้ก่อน\nแล้วลองใหม่รอบถัดไป"]], QCOUNT("7S")],
  ];
  cols3.forEach(([h, who, items, q], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP - 0.15, 3.95, 4.1, i === 2 ? "tint" : "card");
    txt(s, h, { x, y: TOP, w: 3.6, h: 0.45, fontSize: 19, bold: true });
    const pw = pill(s, who, x, TOP + 0.55, who === "ระบบทำ" ? BRAND : DANGER, who === "ระบบทำ" ? SELECTED : DANGER_BG);
    pill(s, `${q} query`, x + pw + 0.15, TOP + 0.55, SUBTLE, SUNKEN);
    points(s, items, x, TOP + 1.2, 3.6, { gap: 1.3, size: 15, small: 13 });
  });
  panel(s, M - 0.2, TOP + 4.1, W - 2 * M + 0.4, BOTTOM - TOP - 4.1);
  label(s, "'จัดส่งสำเร็จ' ต้องครบ 3 เงื่อนไข", M, TOP + 4.25, 6, SUCCESS);
  txt(s, "ขนส่งแจ้งส่งถึง (delivered)  +  แจ้งเลขติดตามแล้ว  +  ตัดสต๊อกครบทุกรายการ\n7S ไม่ตั้งสถานะนี้เอง ถ้าขนส่งยังไม่แจ้งส่งถึง  ·  ทุกครั้งที่ Admin กดปุ่ม Q7S.1 หยิบ Order ที่ค้างมาตัดใหม่", { x: M, y: TOP + 4.6, w: W - 2 * M, h: 0.7, fontSize: 14 });
  notes(s, 1, "กลุ่มหลังพิมพ์ใบปะ 8A Admin ส่งมอบพัสดุและบันทึกเลขติดตาม ถ้าไม่มีเลขติดตาม Order รอที่ รอส่งมอบ เมื่อเปิดหน้าจัดส่ง ระบบดึงสถานะจากขนส่ง 5S ส่งเลขติดตามให้ลูกค้าผ่าน Rakuten โดยเช็กประวัติก่อนเพื่อไม่ส่งซ้ำ 7S ตัดสต๊อกตามแหล่งที่ 3S เลือก และเข้าคิวอัปเดตยอดใน Rakuten ถ้า Rakuten ล่มตัดในระบบไว้ก่อน Order จัดส่งสำเร็จได้ต้องครบ 3 เงื่อนไข");
}

// 32 7S Sequence
{
  const s = content("7S Sequence diagram", "รอบลองใหม่ (Q7S.1) → ตัดสต๊อก → ส่งยอดให้ Rakuten");
  seqParts(s, "7S", [1]);
  notes(s, 1, "Sequence Diagram ของ 7S ส่วนแรกจาก 3 ส่วน เริ่มที่ ExecuteWorkflow ไม่มี Actor เพราะระบบทำเอง เริ่มจากรอบ retry Q7S.1 ที่หา Order ที่แจ้งเลขติดตามแล้วแต่ยังตัดสต๊อกไม่ครบ ครั้งละไม่เกิน 100 รายการ และข้ามแถวที่ถูกล็อก จากนั้น Q7S.2 ล็อกรายการและแถว stock Q7S.4 ลดยอดตามแหล่ง Q7S.5 ตั้ง stock_deducted แล้วเข้าคิว sync กับ Rakuten ปิยากรจะอธิบายเรื่องการกันตัดซ้ำในส่วนสถาปัตยกรรม");
}

// 33 4A · 7A · 10A
{
  const s = content("4A · 7A · 10A", "นำเข้า ยกเลิก และลบข้อมูลเก่า");
  const cols3 = [
    ["4A ดึง Order เข้าระบบ", [["Admin กดนำเข้าที่ Dashboard", "ตัวเชื่อม Rakuten ดึง Order ใหม่"], ["Q4A.5 บันทึก Order + รายการ", "ข้าม Order ซ้ำ\nแจ้ง Order ไม่ครบ / SKU ยังไม่ลงทะเบียน"], ["Q4A.6 ลูกค้าขอยกเลิก", "ทำเครื่องหมายว่าลูกค้าขอยกเลิก"]], QCOUNT("4A")],
    ["7A ยกเลิก Order", [["ต้องใส่เหตุผล", "\"กรุณาระบุเหตุผลการยกเลิก\""], ["Q7A.3 คืนสต๊อกตามคลังที่ตัด", "ถ้าตัดไปแล้ว"], ["ส่งมอบแล้ว → 'รอดำเนินการพิเศษ'", "Q7A.4–5 ยกเลิกใบสั่งซื้อที่ยังเปิด\nOrder อื่นที่ผูกไว้กลับไป 5A"]], QCOUNT("7A")],
    ["10A ลบข้อมูลเก่า", [["เฉพาะข้อมูลที่ปิดแล้ว", "Order 'จัดส่งสำเร็จ' / 'ยกเลิกแล้ว'\nใบสั่งซื้อ (PO) ที่จบแล้ว"], ["Q10A.1 เก็บสำเนาก่อนลบ", "Order + รายการ + ใบปะ\nลงประวัติการลบ"], ["ลบทั้งชุด หรือไม่ลบเลย", "ไม่ลบใบสั่งซื้อที่ Order\nยังเปิดอ้างอยู่"]], QCOUNT("10A")],
  ];
  cols3.forEach(([h, items, q], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP - 0.15, 3.95, BOTTOM - TOP + 0.15, i === 1 ? "tint" : "card");
    txt(s, h, { x, y: TOP, w: 3.6, h: 0.45, fontSize: 19, bold: true });
    pill(s, `${q} query`, x, TOP + 0.55, SUBTLE, SUNKEN);
    points(s, items, x, TOP + 1.2, 3.6, { gap: 1.3, size: 15, small: 13 });
  });
  notes(s, 1, "กลุ่มสุดท้าย 4A นำเข้า Order จาก Rakuten ข้าม Order ซ้ำ และบันทึกคำขอยกเลิกของลูกค้า 7A ยกเลิก Order ต้องใส่เหตุผล คืนสต๊อกตามคลังที่ตัดไป ถ้าส่งมอบแล้วไปที่รอดำเนินการพิเศษ ถ้ายกเลิกใบสั่งซื้อด้วย Order อื่นที่ผูกไว้กลับไปรอตัดสินใจ 5A และ 10A ลบข้อมูลที่ปิดแล้ว เก็บ snapshot ก่อนลบเสมอ ต่อไปขอส่งให้ปิยากรเล่าการออกแบบฐานข้อมูลและสถาปัตยกรรมครับ");
}

// ================================================================ ปิยากร สไลด์ 34–57

// 34 ER
{
  const s = content("ER diagram", `${N_TABLES} entity · 22 relationship · ไม่มี M:N (หลายต่อหลาย)`);
  const r = img(s, DB("er-diagram.png"), M, TOP - 0.05, 8.6, BOTTOM - TOP - 0.05, { align: "l", card: true });
  const x = r.x + r.w + 0.6, w = W - M - x;
  panel(s, x - 0.25, TOP - 0.15, w + 0.45, BOTTOM - TOP + 0.15, "tint");
  points(s, [["ER แบบ Chen = ฐานข้อมูลจริง", "ตรงกับไฟล์สร้างตาราง 001–008\nไม่นับ schema_migrations\n(ตารางจดเวอร์ชันฐานข้อมูล)"], ["ทุกเส้น 1:1 หรือ 1:N", "เส้นคู่ = ทุกแถวต้องมีคู่\n(total participation)"], ["ใบสั่งซื้อ 1 ใบ : หลาย Order", "เก็บเลขใบสั่งซื้อไว้ใน Order\nไม่ต้องมีตารางเชื่อม"],
    ["Order 1 : หลายรายการสินค้า", "แยกรายการไว้ใน order_items\nจึงไม่เกิด M:N กับ skus"]], x, TOP + 0.1, w, { gap: 1.3, size: 15, small: 12.5 });
  notes(s, 2, `ขอบคุณค่ะ query ทุกข้อจาก Use Case Description นำมาออกแบบฐานข้อมูล ER Diagram แบบ Chen มี ${N_TABLES} entity ตรงกับตารางจริงใน migrations 001 ถึง 008 และ CRUD Table มี 22 relationship ทุกเส้นเป็น 1:1 หรือ 1:N เส้นคู่คือ total participation ความสัมพันธ์ที่เปลี่ยนล่าสุดคือ reorders ครอบคลุม orders แบบ 1:N เพราะใบสั่งซื้อหนึ่งใบครอบคลุมหลาย Order ส่วน Order กับสินค้าแยกผ่าน order_items จึงไม่มี M:N รายงานรอบแรกออกแบบไว้ 15 ตาราง พอสร้างเว็บจริงจึงปรับเป็น ${N_TABLES}`);
}

// 35 ER + query
{
  const s = content("ER diagram with queries", `ป้ายสีแดง = query ที่กระทำกับ entity (${RESULTS.length} query)`);
  const half = (W - 2 * M - 0.3) / 2;
  [["er-query-3.png", "กลุ่มสินค้า สต๊อก และการสั่งซื้อ"], ["er-query-4.png", "กลุ่มจัดส่งและใบปะ"]].forEach(([f, l], k) => {
    const x = M + k * (half + 0.3);
    panel(s, x - 0.1, TOP - 0.1, half + 0.2, BOTTOM - TOP + 0.05);
    label(s, l, x, TOP - 0.05, half, BRAND);
    img(s, DB(f), x, TOP + 0.3, half, BOTTOM - TOP - 0.45, { align: "t" });
  });
  notes(s, 2, `ER พร้อม Query แบ่ง 4 ส่วนเหมือน ER หลัก สไลด์นี้แสดง 2 ส่วน แต่ละ entity แสดงเฉพาะ primary key และ foreign key ป้ายสีแดงบอกเลข query ที่ใช้ entity นั้น ถ้าเป็น UPDATE จะแสดง attribute ที่ถูกแก้พร้อมเลข query รวมทั้งหมด ${RESULTS.length} query`);
}

// 36 โครงสร้างตาราง + ตาราง query
{
  const s = content("Tables and queries", `${N_TABLES} ตาราง · ${RESULTS.length} query`);
  panel(s, M - 0.2, TOP - 0.15, 6.0, BOTTOM - TOP + 0.15);
  label(s, `${N_TABLES} ตารางในฐานข้อมูล (2.17)`, M, TOP - 0.05, 5.6, BRAND);
  const groups = [["หลัก", "admins, suppliers, skus, stock, costs"], ["Order", "orders, order_items, reorders, labels"], ["ประวัติ", "cost_history, stock_adjustment_history, label_print_history, tracking_notification_logs, deletion_history"],
    ["ระบบ", "sessions, auto_error_logs, rakuten_stock_sync_states"]];
  groups.forEach(([k, v], i) => {
    txt(s, k, { x: M, y: TOP + 0.4 + i * 0.85, w: 1.0, h: 0.75, fontSize: 14, bold: true, color: BRAND });
    txt(s, v, { x: M + 1.05, y: TOP + 0.4 + i * 0.85, w: 4.5, h: 0.8, fontFace: MONO, fontSize: 12 });
  });
  label(s, "ในเล่มแต่ละตารางมี", M, TOP + 3.75, 5.6, BRAND);
  txt(s, ["attribute, คำอธิบาย, ชนิดข้อมูล", "key (PK/FK), NOT NULL, CHECK", "ตัวอย่างข้อมูล 5 แถว", "ยกเว้น admins มี 2 แถว (มี Super Admin คนเดียว)"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x: M, y: TOP + 4.1, w: 5.6, h: 1.2, fontSize: 13.5, color: SUBTLE });
  const x = 6.6, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15, "tint");
  label(s, "ตาราง Query (2.16) ตัวอย่าง", x, TOP - 0.05, w, BRAND);
  const sample = ["Q3S.1", "Q3S.3", "Q6A.14", "Q7S.5", "Q10A.5"].map((id) => RESULTS.find((r) => r.id === id));
  grid(s, [["Query", "UC", "SQL (ย่อ)"], ...sample.map((r) => [r.id, r.uc, r.sql.replace(/\s+/g, " ").slice(0, 70) + "…"])], x, TOP + 0.3, [0.85, 0.5, w - 1.35], 0.7, { size: 11, boldCol: 0,
    style: (r, i, j) => (i && j === 2 ? { fontFace: MONO, fontSize: 10.5 } : {}) });
  txt(s, "SQL ทุกข้อคัดลอกจากโค้ดของเว็บตรงๆ\nในเล่มบอกชื่อไฟล์ที่ใช้คำสั่งนั้นด้วย", { x, y: TOP + 4.6, w, h: 0.7, fontSize: 13, color: SUBTLE });
  notes(s, 2, `โครงสร้างตารางใน 2.17 ครบทั้ง ${N_TABLES} ตาราง แบ่งเป็นตารางหลัก ตาราง Order ตารางประวัติ และตารางของระบบ แต่ละตารางมี attribute คำอธิบาย key NOT NULL ชนิดข้อมูล CHECK และตัวอย่างข้อมูล 5 แถว ยกเว้น admins มี 2 แถวเพราะมี Super Admin คนเดียว ทางขวาคือตาราง Query ใน 2.16 มีเลข query, Use Case และคำสั่ง SQL ทั้ง ${RESULTS.length} ข้อ SQL ทุกข้อคัดลอกจากค่าคงที่ในโค้ดของเว็บ`);
}

// 37 Class diagram
{
  const s = content("Class diagram", "15 รูป ได้จาก object ทุกตัวใน Sequence");
  const { x, w } = figure(s, DB("class-5.png"), 8.2);
  label(s, "รูปนี้คือกลุ่ม 3S + 7S", x, TOP, w, BRAND);
  txt(s, "12 รูปตามกลุ่มงาน\n+ 3 รูปของคลาสข้อมูล (Entity)", { x, y: TOP + 0.35, w, h: 0.7, fontSize: 13.5, color: SUBTLE });
  label(s, "ชั้นของคลาส", x, TOP + 1.2, w, BRAND);
  txt(s, ["View = Screen (หน้าเว็บ)", "Controller = รับคำสั่งจากหน้าเว็บ", "Model = UseCase + ExecuteWorkflow", "Queries = เก็บคำสั่ง SQL", "DBConnector = ตัวต่อฐานข้อมูล", "Adapter = ตัวเชื่อมระบบภายนอก"].map((t) => ({ text: t, options: { breakLine: true } })), { x, y: TOP + 1.55, w, h: 2.0, fontSize: 13.5, lineSpacingMultiple: 1.15 });
  label(s, "ความสัมพันธ์", x, TOP + 3.65, w, BRAND);
  txt(s, ["association = ถือ object อีกตัวไว้ใช้", "dependency = เรียกใช้ชั่วคราว", "aggregation = ประกอบด้วยส่วนย่อย", "realization = ทำตาม interface"].map((t) => ({ text: t, options: { breakLine: true } })), { x, y: TOP + 4.0, w, h: 1.3, fontSize: 13.5, lineSpacingMultiple: 1.1 });
  notes(s, 2, "Class Diagram ได้จาก object ทุกตัวใน Sequence และ Collaboration ของทั้ง 17 Use Case แบ่งเป็น 15 รูป 12 รูปตามกลุ่มงาน อีก 3 รูปเป็นคลาสข้อมูล รูปนี้คือกลุ่ม 3S กับ 7S ชั้นของคลาสตรงกับโค้ดจริง Screen Controller UseCase Queries DBConnector และ Adapter ความสัมพันธ์มี association dependency aggregation และ realization ที่ MockAdapters implement interface ของ Adapter");
}

// State Diagram: รูปเรียงเป็นคอลัมน์เท่ากัน ถ้ายังไม่มีรูปแสดงกรอบบอกชื่อไฟล์
function stateImgs(s, files, x0 = M, w0 = W - 2 * M) {
  const gap = 0.35, cw = (w0 - gap * (files.length - 1)) / files.length;
  files.forEach(([f, cap], k) => {
    const x = x0 + k * (cw + gap);
    panel(s, x - 0.1, TOP - 0.15, cw + 0.2, BOTTOM - TOP + 0.15);
    label(s, cap, x, TOP - 0.05, cw, BRAND);
    if (fs.existsSync(DB(f))) img(s, DB(f), x, TOP + 0.3, cw, BOTTOM - TOP - 0.4, { align: "t" });
    else txt(s, `[รอรูป ${f}]`, { x, y: TOP + 2, w: cw, h: 0.5, fontSize: 16, color: DANGER, align: "center" });
  });
}

// 38 State Order ก่อนจัดส่ง
{
  const s = content("State diagram: Order (1/3)", "สถานะ Order · อ่านเส้น: [เงื่อนไข] เหตุการณ์ / Use Case (Query)");
  const { x, w } = figure(s, DB("state-1.png"), 6.2);
  label(s, "ตัวอย่างเส้น", x, TOP, w, BRAND);
  code(s, "[RSL ไม่พอ คลังบริษัทพอ] / 3S (Q3S.4)\nรอตรวจสอบสต๊อก → รอจัดรูปแบบใบปะสินค้า", x, TOP + 0.35, w, 0.85, 11.5);
  points(s, [["22 สถานะ ตรงกับโค้ดของเว็บ", "ทุกเส้นคือคำสั่งแก้สถานะใน query นั้น"], ["3S ออกได้ 3 ทาง", "RSL / คลังบริษัท / รอ Admin ตัดสินใจ"],
    ["'สั่งซื้อแล้ว' ออกได้ 2 ทาง", "รับของ 6A (Q6A.14) หรือยกเลิกใบสั่งซื้อ 7A (Q7A.5)"], ["รอดำเนินการด้วยตนเอง", "บันทึกสาเหตุไว้ เช่น ไม่พบกฎ SKU, ไม่มีราคา"]], x, TOP + 1.45, w, { mark: BRAND, gap: 0.98, size: 15, small: 12.5 });
  notes(s, 2, "อาจารย์ขอ State Diagram ของข้อมูลที่ถูก update เราทำครบทุกคอลัมน์สถานะในฐานข้อมูล เริ่มจาก Order.order_status มี 22 สถานะ แบ่งสามสไลด์ สไลด์นี้คือช่วงก่อนจัดส่ง ทุกเส้นเขียนเป็นเงื่อนไข event และ Use Case พร้อมเลข query ที่ UPDATE สถานะ เช่น RSL ไม่พอแต่คลังบริษัทพอ 3S Q3S.4 เปลี่ยนเป็นรอจัดรูปแบบใบปะ สถานะสั่งซื้อแล้วออกได้สองทาง รับของ 6A หรือยกเลิกใบสั่งซื้อ 7A");
}

// 39 State Order ช่วงจัดส่ง ส่วนแรก: รูป state-2 ในเล่มตัดเป็นแนวนอนสองแถบ วางซ้อนกันเต็มความกว้าง
{
  const s = content("State diagram: Order (2/3)", "บน: จับคู่ RSL · จัดรูปแบบใบปะ   ล่าง: 9A พิมพ์ใบปะ · 8A ส่งมอบ");
  const files = [DB("state-2a.png"), DB("state-2b.png")], gap = 0.12, y0 = TOP - 0.02, y1 = BOTTOM - 0.12;
  const ratio = files.map((f) => { const [iw, ih] = pngSize(f); return ih / iw; });
  const w = Math.min(W - 2 * M - 0.3, (y1 - y0 - gap) / (ratio[0] + ratio[1])), x = (W - w) / 2;
  panel(s, x - 0.15, y0 - 0.12, w + 0.3, y1 - y0 + 0.24);
  let y = y0;
  files.forEach((f, k) => { img(s, f, x, y, w, w * ratio[k]); y += w * ratio[k] + gap; });
  notes(s, 2, "ช่วงจัดส่งของ Order ในเล่มเป็นรูปเดียวแนวตั้ง บนสไลด์ตัดเป็นแถบแนวนอนให้ตัวอักษรอ่านได้ แถบบนต่อจากสไลด์ก่อน Order ที่ใช้ RSL ต้องจับคู่เลข RSL ใน 1S แล้ว 2A จัดรูปแบบใบปะเป็นรอพิมพ์ใบปะสินค้า ถ้ายกเลิกการจับคู่ RSL กลับไปยังไม่ได้จับคู่ แถบล่าง 9A พิมพ์ใบปะเป็นพิมพ์ใบปะสินค้าแล้ว 8A ส่งมอบ ถ้ามีเลขติดตามเป็นอยู่ระหว่างจัดส่ง ถ้าไม่มีเลขติดตาม Order รอที่รอส่งมอบ");
}

// 40 State Order ช่วงจัดส่ง ส่วนท้าย + เงื่อนไขสำคัญ
{
  const s = content("State diagram: Order (3/3)", "5S แจ้งเลขติดตาม → 7S ตัดสต๊อก → จัดส่งสำเร็จ");
  const f = DB("state-2c.png"), [iw, ih] = pngSize(f), stripH = 1.05, y0 = TOP - 0.02;
  const w = Math.min(W - 2 * M - 0.3, (BOTTOM - stripH - 0.35 - y0) * iw / ih), x = (W - w) / 2;
  img(s, f, x, y0, w, w * ih / iw, { card: true });
  const sy = BOTTOM - stripH, cw = (W - 2 * M - 0.3) / 2;
  [["'จัดส่งสำเร็จ' ต้องครบ 3 เงื่อนไข", "ขนส่งแจ้งส่งถึง (delivered) + แจ้งเลขติดตามแล้ว + ตัดสต๊อกครบทุกรายการ"], ["ยกเลิกหลังส่งมอบ", "7A → รอดำเนินการพิเศษ ให้ Admin จัดการต่อ"]].forEach(([h, d], k) => {
    const xx = M + k * (cw + 0.3);
    panel(s, xx, sy, cw, stripH, "tint");
    txt(s, h, { x: xx + 0.2, y: sy + 0.12, w: cw - 0.4, h: 0.4, fontSize: 15, bold: true, color: BRAND });
    txt(s, d, { x: xx + 0.2, y: sy + 0.52, w: cw - 0.4, h: 0.45, fontSize: 13, color: SUBTLE });
  });
  notes(s, 2, "ส่วนท้ายของช่วงจัดส่ง 5S แจ้งเลขติดตามให้ Rakuten สำเร็จเป็นแจ้งเลขติดตามแล้ว แล้ว 7S ตัดสต๊อก Order จะเป็นจัดส่งสำเร็จได้ต้องครบสามเงื่อนไข ขนส่งแจ้ง delivered แจ้งเลขแล้ว และตัดสต๊อกครบทุกรายการ ถ้ายกเลิกหลังส่งมอบแล้ว 7A ส่งไปที่รอดำเนินการพิเศษให้ Admin จัดการเอง");
}

// 41 State Reorder
{
  const s = content("State diagram: Reorder", "สถานะใบสั่งซื้อ Supplier (reorder_status) · 5A, 6A, 7A, 10A");
  const { x, w } = figure(s, DB("state-reorder.png"), 7.2);
  points(s, [["Q6A.7 สร้าง", "รอส่งคำสั่งซื้อ"], ["Q6A.9 Supplier รับ", "สั่งซื้อแล้ว ส่งไม่สำเร็จคงสถานะเดิม"], ["Q6A.11 รับของ", "ได้รับสินค้าแล้ว รับซ้ำไม่ได้"], ["Q7A.4 ยกเลิก", "ยกเลิกแล้ว พร้อม Order"], ["Q10A.4 ลบ", "เฉพาะใบที่ปิดแล้ว"]],
    x, TOP + 0.1, w, { mark: BRAND, gap: 0.98, size: 15, small: 12.5 });
  notes(s, 2, "State ของใบสั่งซื้อ Reorder.reorder_status 6A สร้างใบสั่งซื้อเป็นรอส่งคำสั่งซื้อ Q6A.7 ถ้า Supplier รับเป็นสั่งซื้อแล้ว Q6A.9 ถ้าส่งไม่สำเร็จคงสถานะเดิมให้ลองใหม่ รับของ Q6A.11 เป็นได้รับสินค้าแล้วได้ครั้งเดียว ยกเลิกพร้อม Order ใน 7A Q7A.4 และ 10A ลบเฉพาะใบที่ปิดแล้ว");
}

// 42 State Label + SKU
{
  const s = content("State diagram: Label · SKU", "สถานะใบปะ (label_status) และสถานะสินค้า (sku_status)");
  stateImgs(s, [["state-label.png", "สถานะใบปะ · 6S 9A 1S 10A"], ["state-sku.png", "สถานะสินค้า (เปิด/ปิดขาย) · 3A"]]);
  notes(s, 2, "ซ้ายคือ State ของใบปะ Label.label_status 6S สร้างใบปะเป็น ready Q6S.4 9A พิมพ์สำเร็จเป็น printed Q9A.4 ถ้ายกเลิกการจับคู่ RSL ใน 1S ใบปะที่ยังไม่พิมพ์ถูกลบ Q1S.4 ขวาคือ Sku.sku_status ใน 3A เปิดหรือปิดการขายสลับ active กับ inactive ด้วย Q3A.9 และลบได้เมื่อไม่มีข้อมูลที่อ้างถึง Q3A.11");
}

// 43 State delivery + sync
{
  const s = content("State diagram: delivery · sync", "สถานะขนส่ง และสถานะส่งยอดสต๊อกให้ Rakuten");
  stateImgs(s, [["state-delivery.png", "สถานะขนส่ง (delivery_status) · 8A"], ["state-sync.png", "ส่งยอดสต๊อกให้ Rakuten (sync_status) · 3S 6A 7S"]]);
  notes(s, 2, "ซ้ายคือสถานะขนส่ง Order.delivery_status ได้เลขติดตามใน 8A เป็น in_transit แล้วเมื่อเปิดหน้าจัดส่ง ระบบดึงสถานะจากขนส่งเป็น delivered failed หรือ returned ด้วย Q8A.4 ขวาคือสถานะ sync ยอดสต๊อกกับ Rakuten ทุกครั้งที่ยอดเปลี่ยนจาก 3S 6A หรือ 7S เป็น pending แล้ว 7S ส่งยอดให้ Rakuten สำเร็จเป็น synced ส่งไม่สำเร็จคง pending ไว้ลองใหม่");
}

// 44 สถาปัตยกรรมชั้น
{
  const s = content("Layers of the web app", "ทุกหน้าอ่านเขียน PostgreSQL จริง");
  panel(s, M - 0.2, TOP - 0.15, 7.0, BOTTOM - TOP + 0.15);
  const layers = [["View (Screen)", "หน้าเว็บ (page)", "app/(app)/*"], ["Controller", "รับคำสั่งจากหน้าเว็บ (Server Action)", "app/(app)/actions.ts"], ["UseCase", "ขั้นตอนของแต่ละ Use Case", "lib/use-cases/*"],
    ["Queries", "เก็บคำสั่ง SQL", "lib/queries/*"], ["DBConnector", "ต่อฐานข้อมูล PostgreSQL", "lib/db.ts"]];
  layers.forEach(([n, d, f], i) => {
    const y = TOP + i * 1.03;
    chip(s, n, M, y, 2.0, 0.7, i === 2 ? "auto" : undefined);
    txt(s, d, { x: M + 2.2, y, w: 2.3, h: 0.7, fontSize: 14, valign: "middle" });
    txt(s, f, { x: M + 4.5, y, w: 2.1, h: 0.7, fontFace: MONO, fontSize: 11, color: SUBTLE, valign: "middle" });
    if (i < layers.length - 1) arrow(s, M + 1.0, y + 0.72, 0, 0.29);
  });
  s.addShape(pres.shapes.LINE, { x: M + 2.0, y: TOP + 2 * 1.03 + 0.35, w: 0.0, h: 0, line: { color: SUBTLEST } });
  const x = 7.6, w = W - M - x;
  panel(s, x - 0.25, TOP - 0.15, w + 0.45, BOTTOM - TOP + 0.15, "tint");
  chip(s, "Adapters (ตัวจำลอง)", x, TOP, w, 0.7, "auto");
  txt(s, "UseCase เรียกระบบภายนอกผ่านตัวเชื่อม (interface)", { x, y: TOP + 0.8, w, h: 0.6, fontSize: 13.5, color: SUBTLE });
  label(s, "ไม่มีในโค้ด", x, TOP + 1.65, w, DANGER);
  txt(s, ["API แยกให้ระบบอื่นเรียก (REST API)", "คลาส Controller / Repository (เป็นชื่อบทบาท)", "ตัวตั้งเวลาทำงาน (Scheduler / cron)", "เก็บข้อมูลในเบราว์เซอร์ (ใช้แค่จำภาษา)"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x, y: TOP + 2.0, w, h: 1.6, fontSize: 14 });
  label(s, "ฐานข้อมูล", x, TOP + 3.75, w, BRAND);
  txt(s, `PostgreSQL ${N_TABLES} ตาราง สร้างจากไฟล์ 001–008\nรีเซ็ตเป็นข้อมูลตั้งต้นด้วย npm run db:reset`, { x, y: TOP + 4.1, w, h: 0.9, fontSize: 14 });
  notes(s, 2, `ส่วนนี้คือสถาปัตยกรรมของเว็บที่สร้างจริง มี 5 ชั้นตาม MVC ชั้น View คือ page ของ Next.js ซึ่งใน Sequence ตั้งชื่อเป็น Screen Controller คือ Server Action ใน actions.ts ซึ่งเรียก UseCase แต่ละ UseCase ใช้โมดูล Queries ที่เก็บ SQL เป็นค่าคงที่ และเข้าฐานข้อมูลผ่าน db.ts ระบบภายนอกเรียกผ่าน Adapter ในโค้ดไม่มี REST API แยก ไม่มีคลาส Controller หรือ Repository ชื่อ Screen และ Controller ใน Sequence คือบทบาทของ page กับ Server Action และไม่มี Scheduler ข้อมูลทั้งหมดอยู่ใน PostgreSQL ${N_TABLES} ตาราง ไม่ใช่ localStorage`);
}

// 45 executeWorkflow
{
  const s = content("executeWorkflow", "Use Case อัตโนมัติทำต่อจากปุ่มของ Admin ในงานเดียวกัน (transaction)");
  panel(s, M - 0.2, TOP - 0.15, 7.3, BOTTOM - TOP + 0.15);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M, y: TOP, w: 6.9, h: 3.4, rectRadius: 0.06, fill: { color: SUNKEN }, line: { color: BORDER, width: 0.5 } });
  label(s, "Admin กดปุ่ม 1 ครั้ง ระบบเปิดงานเดียว (transaction) แล้วทำตามลำดับ", M + 0.15, TOP + 0.12, 6.6, BRAND);
  const sub = (t) => ({ text: t, options: { breakLine: true, indentLevel: 1, bullet: true, color: SUBTLE, fontSize: 13.5 } });
  txt(s, [{ text: "1. ทำสิ่งที่ Admin กด เช่น 2A ยืนยัน Order", options: { breakLine: true } },
    { text: "2. ทำ Use Case อัตโนมัติต่อทันที (runAutomation)", options: { breakLine: true } },
    sub("Order ที่ส่งมา: 2S → 3S → 1S หรือ 6S"), sub("ลองใหม่: Order ค้าง 'รอจับคู่กฎ SKU' (Q2S.5)"), sub("ลองใหม่: Order ค้างตัดสต๊อก (Q7S.1)"), sub("ส่งยอดสต๊อกให้ Rakuten (7S)"),
    { text: "3. สำเร็จ → บันทึกทั้งหมด (COMMIT)", options: { breakLine: true } }, { text: "    พัง → ยกเลิกทั้งหมด (ROLLBACK)" }],
    { x: M + 0.15, y: TOP + 0.5, w: 6.6, h: 2.8, fontSize: 15, lineSpacingMultiple: 1.1 });
  label(s, "ถ้าขั้นอัตโนมัติพัง", M, TOP + 3.6, 6, DANGER);
  txt(s, ["ยกเลิกทั้งหมด รวมสิ่งที่ Admin กด", "บันทึกข้อผิดพลาดแยกไว้ (auto_error_logs)", "ข้อมูลจึงไม่ค้างครึ่งทาง"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x: M, y: TOP + 3.95, w: 6.9, h: 1.3, fontSize: 14.5 });
  const x = 8.1, w = W - M - x;
  panel(s, x - 0.25, TOP - 0.15, w + 0.45, BOTTOM - TOP + 0.15, "tint");
  label(s, "ทำไมไม่มี Scheduler", x, TOP, w, BRAND);
  points(s, [["ผลเห็นทันที", "Admin กดยืนยันแล้วเห็นใบปะในหน้าถัดไป"], ["ข้อมูลไม่ค้างครึ่งทาง", "ปุ่มกับขั้นอัตโนมัติบันทึกพร้อมกัน"], ["ไม่มีงานค้างตลอดไป", "ทุกครั้งที่กดปุ่ม ระบบลองงานที่ค้างใหม่"],
    ["เปิดหน้าจัดส่ง", "ดึงสถานะขนส่ง และ 6S ทำงานต่อ"]], x, TOP + 0.4, w, { gap: 1.05, size: 15, small: 12.5 });
  notes(s, 2, "Use Case ที่ระบบทำเอง 2S 3S 6S 7S ทำงานผ่าน executeWorkflow ซึ่งเปิด transaction เดียว รันปุ่มที่ Admin กด แล้วรัน runAutomation ต่อ ทำ Use Case อัตโนมัติของ Order นั้น และหยิบงานที่ค้างมาทำใหม่ เช่น Order ที่ค้างจับคู่กฎ SKU หรือค้างตัดสต๊อก ถ้าขั้นอัตโนมัติพัง ทั้ง transaction ย้อนกลับ แล้วบันทึก error แยกไว้ เราไม่ใช้ Scheduler เพราะงานเกิดจากการกดของ Admin อยู่แล้ว ผลเห็นทันทีและไม่ค้างครึ่งทาง ถ้าเปิดใช้จริงจะเพิ่มตัวตั้งเวลาเรียก executeWorkflow ได้โดยไม่แก้ UseCase");
}

// 46 ล็อกแถวและกันตัดซ้ำ
{
  const s = content("Locks and double deduction", "ล็อกแถว (row lock) กันแก้ข้อมูลชนกัน");
  panel(s, M - 0.2, TOP - 0.15, 6.0, BOTTOM - TOP + 0.15);
  label(s, "ล็อกแถวก่อนแก้ (คำสั่ง FOR UPDATE)", M, TOP - 0.05, 5.6, BRAND);
  grid(s, [["Query", "ล็อกข้อมูล", "กันอะไร"], ["Q2A.1", "Order", "Admin สองแท็บยืนยันพร้อมกัน"], ["Q3S.1", "สต๊อก", "สอง Order จองของชิ้นเดียว"], ["Q5A.1", "Order", "ตัดสินใจซ้ำ"],
    ["Q6A.10", "ใบสั่งซื้อ + สต๊อก", "รับของซ้ำ"], ["Q7S.2", "รายการ + สต๊อก", "ตัดสต๊อกซ้ำ"], ["Q7S.1", "ข้ามแถวที่ล็อก ≤100", "รอบลองใหม่ไม่ต้องรอ"]], M, TOP + 0.35, [1.0, 1.95, 2.65], 0.62, { size: 13, boldCol: 0 });
  const x = 6.6, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15, "tint");
  label(s, "กันตัดสต๊อกซ้ำ 3 ชั้น", x, TOP - 0.05, w, DANGER);
  points(s, [["ล็อกรายการ + สต๊อก (Q7S.2)", "รอบที่สองต้องรอรอบแรกบันทึกเสร็จ"], ["ตัดเฉพาะรายการที่ยังไม่ตัด", "โค้ดข้ามรายการที่ตัดแล้วก่อนเริ่ม"], ["แก้แบบมีเงื่อนไข (Q7S.5)", "ตั้งเป็น 'ตัดแล้ว' ได้เฉพาะแถวที่ยังไม่ตัด"]],
    x, TOP + 0.35, w, { mark: DANGER, gap: 1.1, size: 15, small: 12.5 });
  label(s, "ยอดในคลังไม่ติดลบ", x, TOP + 3.6, w, DANGER);
  txt(s, ["Q7S.4 ลดยอดได้เฉพาะเมื่อยอดในคลังพอ", "สต๊อกไม่พอ → 'รอดำเนินการด้วยตนเอง' ไม่วนตัดซ้ำ"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x, y: TOP + 3.95, w, h: 0.9, fontSize: 14 });
  notes(s, 2, "เพราะ action หลายตัวอาจแตะ Order และสต๊อกเดียวกัน ทุกจุดที่แก้ข้อมูลสำคัญจึงล็อกแถวก่อนด้วย FOR UPDATE ตามตารางซ้าย ส่วนรอบ retry ใช้ SKIP LOCKED จะได้ไม่รอแถวที่คนอื่นล็อกอยู่ การกันตัดสต๊อกซ้ำมี 3 ชั้น ล็อกรายการและแถว stock ตัดเฉพาะรายการที่ยังไม่ตัด และ UPDATE มีเงื่อนไข stock_deducted = FALSE ถ้าสองรอบมาพร้อมกัน รอบที่สองจะเห็นว่าตัดแล้ว และยอดในคลังจะไม่ติดลบ");
}

// 47 ระบบภายนอก
{
  const s = content("External systems", "ทุกระบบภายนอกต่อผ่านตัวเชื่อม (adapter) ตอนนี้เป็นตัวจำลอง");
  panel(s, M - 0.2, TOP - 0.15, 6.4, BOTTOM - TOP + 0.15);
  label(s, "ตัวเชื่อม (adapter) 6 ตัว", M, TOP - 0.05, 6, BRAND);
  grid(s, [["Adapter", "ใช้ใน", "งาน"], ["RakutenAdapter", "4A 2A 5S 7S", "ดึง Order, ส่งเลขติดตาม\nอัปเดตสต๊อก"], ["RslAdapter", "3S 1S", "ยอดสต๊อก RSL, จับคู่เลข RSL"], ["LabelServiceAdapter", "6S", "สร้างใบปะ"],
    ["PrinterAdapter", "9A", "ส่งงานพิมพ์"], ["CarrierAdapter", "8A", "เลขติดตาม, สถานะพัสดุ"], ["SupplierAdapter", "6A", "ส่งใบสั่งซื้อ"]], M, TOP + 0.35, [2.15, 1.3, 2.55], 0.62, { size: 12.5, boldCol: 0 });
  const x = 7.2, w = W - M - x;
  panel(s, x - 0.25, TOP - 0.15, w + 0.45, BOTTOM - TOP + 0.15, "tint");
  label(s, "จากตัวจำลองไปของจริง", x, TOP, w, BRAND);
  points(s, [["เขียนตัวเชื่อมของจริง", "ตาม interface เดิม เช่นเรียก Rakuten RMS API"], ["เพิ่มโหมดในการตั้งค่า (AdapterConfig)", "ตอนนี้มีโหมดเดียวคือ \"mock\" (จำลอง)"], ["UseCase ไม่ต้องแก้", "เพราะเรียกผ่าน interface"]], x, TOP + 0.4, w, { mark: BRAND, gap: 1.05, size: 15, small: 12.5 });
  label(s, "จำลองระบบล่ม", x, TOP + 3.75, w, DANGER);
  txt(s, ["หน้าทดสอบ /dev (ไม่อยู่ในเมนู)", "สั่งให้ตัวเชื่อมตอบผิดพลาดได้", "ใช้ทดสอบกรณีผิดพลาดของทุก Use Case"].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x, y: TOP + 4.1, w, h: 1.0, fontSize: 14 });
  notes(s, 2, "ระบบภายนอกทุกตัวต่อผ่าน adapter มี 6 interface Rakuten RSL บริการสร้าง Label เครื่องพิมพ์ ขนส่ง และ Supplier ตอนนี้ทุกตัวเป็นตัวจำลองเพราะยังไม่มีสิทธิ์ใช้ API จริง ถ้าจะต่อของจริง เขียน implementation ตาม interface เดิมและเพิ่มโหมดใน config UseCase ไม่ต้องแก้ ตัวจำลองยังช่วยทดสอบ เพราะหน้า /dev สั่งให้ระบบภายนอกล่มได้ ใช้ทดสอบกรณีผิดพลาดทุก Use Case");
}

// 48 ความปลอดภัย
{
  const s = content("Security", "รหัสผ่าน session และ SQL");
  [["รหัสผ่าน", ["ไม่เก็บรหัสผ่านตรงๆ", "เข้ารหัสทางเดียวด้วย scrypt", "สุ่ม salt 16 byte ทุกบัญชี", "เทียบรหัสแบบใช้เวลาเท่ากันเสมอ (timingSafeEqual)"], "ค่าตั้ง scrypt: N=16384, r=8, p=1 · key 64 byte"],
   ["Session", ["บัตรผ่าน (token) สุ่ม 32 byte เก็บใน cookie", "ฐานข้อมูลเก็บแค่ค่า hash (SHA-256)", "JavaScript อ่าน cookie ไม่ได้ (httpOnly)", "อายุ 8 ชั่วโมง ออกจากระบบแล้วใช้ต่อไม่ได้"], "cookie: sameSite=lax · secure ตอน production · ออกจากระบบ = ตั้ง revoked_at"],
   ["ฐานข้อมูลและบัญชี", ["SQL ทุกข้อส่งค่าแยก ($1, $2) กัน SQL injection", "รหัสผิด 5 ครั้ง ล็อก 15 นาที", "อีเมลผิดหรือรหัสผิด ได้ข้อความเดียวกัน", "ทุกหน้าหลัง Login ต้องมี session"], ""]].forEach(([h, items, foot], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP - 0.15, 3.95, BOTTOM - TOP + 0.15, i === 1 ? "tint" : "card");
    txt(s, h, { x, y: TOP, w: 3.6, h: 0.5, fontSize: 20, bold: true, color: BRAND });
    txt(s, items.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x, y: TOP + 0.7, w: 3.6, h: 3.5, fontSize: 15, lineSpacingMultiple: 1.3 });
    if (foot) txt(s, foot, { x, y: TOP + 4.45, w: 3.6, h: 0.7, fontSize: 12, color: SUBTLE });
  });
  notes(s, 2, "ด้านความปลอดภัย รหัสผ่านเก็บแบบ scrypt มี salt สุ่มทุกบัญชีและเทียบแบบ timing safe session ใช้ token สุ่ม 32 byte ใน cookie แต่ฐานข้อมูลเก็บแค่ SHA-256 ของ token ถ้าฐานข้อมูลรั่วก็เอาไปใช้เข้าระบบไม่ได้ cookie เป็น httpOnly อายุ 8 ชั่วโมง SQL ทุกข้อส่งค่าผ่าน parameter จึงกัน SQL injection และบัญชีถูกล็อก 15 นาทีเมื่อผิด 5 ครั้ง");
}

// 49 Platform + component
{
  const s = content("Platform and components", "เครื่องมือที่ใช้ และ Component Diagram");
  const r = img(s, PLT("2.22-software-platform.png"), M, TOP - 0.05, 6.2, 3.3, { align: "lt", card: true });
  panel(s, M - 0.2, r.y + r.h + 0.35, 6.4, BOTTOM - r.y - r.h - 0.35, "tint");
  points(s, [["หน้าเว็บ: Next.js 16, React 19, TypeScript 5", "หน้าตา: Tailwind CSS 4, shadcn/ui"], ["ฐานข้อมูล: PostgreSQL (ต่อผ่าน node-postgres)", "รัน SQL ในเล่มด้วย PGlite (PostgreSQL ในหน่วยความจำ)"]], M, r.y + r.h + 0.5, 6.0, { gap: 0.8, size: 14.5, small: 12.5 });
  const x = 7.3, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15);
  label(s, "Component Diagram", x, TOP - 0.05, w, BRAND);
  img(s, DB("component.png"), x, TOP + 0.3, w, BOTTOM - TOP - 0.45, { align: "t" });
  notes(s, 2, "เครื่องมือที่ใช้ ฝั่งหน้าจอเป็น Next.js 16 React 19 และ TypeScript หน้าตาใช้ Tailwind และ shadcn ฐานข้อมูลเป็น PostgreSQL ต่อผ่าน node-postgres และรัน SQL ทุกข้อในเล่มด้วย PGlite ทางขวาคือ Component Diagram แสดงชั้นเดียวกับสไลด์สถาปัตยกรรม หน้าจอ Server Action UseCase Queries ฐานข้อมูล และ Adapter ของระบบภายนอก");
}

// 50 Site map + screens
{
  const s = content("Site map and screens", "เริ่มที่หน้า Login · ชื่อหน้าจอตรงกับ Screen ใน Sequence");
  const SITEMAP = "LoginScreen (1A)\n└ DashboardScreen (4A)\n  ├ คำสั่งซื้อ\n  │ ├ OrderVerifyScreen (2A)\n  │ ├ RslMatchScreen (1S)\n  │ └ CancelOrderScreen (7A)\n  ├ สินค้าและสต๊อก\n  │ ├ ProductScreen (3A)\n  │ ├ StockCheckScreen (3S)\n  │ ├ CostScreen (4S)\n  │ └ ReorderScreen (5A, 6A)\n  ├ จัดส่ง\n  │ ├ ShippingScreen (8A, 5S)\n  │ └ LabelPrintScreen (9A)\n  └ ระบบ\n    └ CleanupScreen (10A)";
  panel(s, M - 0.2, TOP - 0.15, 4.5, BOTTOM - TOP + 0.15);
  label(s, "Site Map", M, TOP - 0.05, 4);
  txt(s, SITEMAP, { x: M, y: TOP + 0.35, w: 4.2, h: BOTTOM - TOP - 0.45, fontFace: MONO, fontSize: 13, lineSpacingMultiple: 1.05 });
  [["ui/2A-OrderVerifyScreen.png", "OrderVerifyScreen · 2A"], ["ui/3S-StockCheckScreen.png", "StockCheckScreen · 3S"], ["ui/5A-6A-ReorderDecisionScreen.png", "ReorderScreen · 5A 6A"],
   ["ui/6A-ReorderScreen-receive.png", "ReorderScreen · รับสินค้า"], ["ui/8A-ShipmentScreen.png", "ShippingScreen · 8A 5S"], ["ui/9A-LabelPrintScreen.png", "LabelPrintScreen · 9A"]].forEach(([f, l], i) => {
    const x = 5.0 + (i % 3) * 2.62, y = TOP - 0.05 + Math.floor(i / 3) * 2.72;
    panel(s, x - 0.1, y - 0.1, 2.52, 2.6);
    label(s, l, x, y, 2.4, BRAND);
    img(s, PLT(f), x, y + 0.38, 2.32, 2.0, { align: "lt", frame: true });
  });
  notes(s, 2, "Site map มี root คือหน้า Login ผู้ใช้ทุกคนเข้าทางเดียวกันจึงมี tree เดียว หลังเข้าสู่ระบบเมนูแบ่ง 5 กลุ่ม แต่ละหน้าจอคือ object Screen ใน Sequence Diagram ในเล่มมี 13 หน้าจอ ตัวอย่าง 6 หน้า Use Case ที่ระบบทำเองไม่มีหน้าจอของตัวเอง ผลขึ้นเป็นข้อความแจ้งเตือนในหน้าที่ Admin เปิดอยู่");
}

// 51 Reports
{
  const MORE = [["แบบใบปะ 3 แบบ ตามแหล่งส่งและวิธีส่ง", "แยกพัสดุหลายกล่อง (1/2, 2/2) ภายใต้ Order เดียว"],
    ["องค์ประกอบต้นทุน 8 รายการ แปลงหยวน (CNY) เป็นบาท", "เก็บประวัติทุกครั้งที่คำนวณ ใช้ประกอบการตัดสินใจ 5A"]];
  const s = content("Output design", "รายงาน 2 ฉบับจากข้อมูลจริง");
  [["report/label-ORD-24178.png", "ใบปะสินค้า (Shipping Label)", "สร้างจาก 6S · พิมพ์จาก 9A"], ["report/unit-cost-FSH-MLR-240.png", "รายงานต้นทุนต่อหน่วย (Unit Cost Report)", "คำนวณจาก 4S"]].forEach(([f, l, d], i) => {
    const x = M + i * 6.17;
    panel(s, x - 0.2, TOP - 0.15, 6.3, BOTTOM - TOP + 0.15);
    label(s, l, x, TOP - 0.05, 5.9, BRAND);
    const r = img(s, PLT(f), x, TOP + 0.35, 5.9, 3.6, { align: "lt", frame: true });
    txt(s, d, { x, y: r.y + r.h + 0.2, w: 5.9, h: 0.45, fontSize: 16, bold: true });
    txt(s, MORE[i].map((m) => ({ text: m, options: { bullet: true, breakLine: true } })), { x, y: r.y + r.h + 0.7, w: 5.9, h: 0.8, fontSize: 14, color: SUBTLE });
  });
  notes(s, 2, "ระบบมีรายงาน 2 ฉบับ ใบปะสินค้าสร้างจาก 6S และพิมพ์จาก 9A มี template ตามแหล่งส่ง 3 แบบ และแยกกล่องได้ ส่วนรายงานต้นทุนต่อหน่วยมาจาก 4S แสดงองค์ประกอบต้นทุน 8 รายการ ทั้งสองรายงานเปิดจากเว็บจริงด้วยข้อมูลที่บันทึกผ่าน Use Case");
}

// 52 SQL results
{
  const s = content("SQL results", "ทุกคำสั่งรันกับข้อมูลตั้งต้นชุดเดียวกัน");
  panel(s, M - 0.2, TOP - 0.15, 4.3, BOTTOM - TOP + 0.15, "tint");
  stat(s, M, TOP, 3.9, `${SQL_OK}/${RESULTS.length}`, "SQL รันผ่านทุกข้อ ไม่มีข้อผิดพลาด");
  const ops = { SELECT: 0, INSERT: 0, UPDATE: 0, DELETE: 0, WITH: 0 };
  RESULTS.forEach((r) => { const k = r.sql.trim().split(/\s+/)[0].toUpperCase(); if (k in ops) ops[k]++; });
  grid(s, [["คำสั่งขึ้นต้นด้วย", "จำนวน"], ...Object.entries(ops).map(([k, v]) => [k, String(v)])], M, TOP + 1.65, [2.6, 1.2], 0.42, { size: 14, boldCol: 1 });
  txt(s, "WITH = หลายขั้นในคำสั่งเดียว\nเช่น แก้สต๊อก แล้วบันทึกประวัติ", { x: M, y: TOP + 4.3, w: 3.9, h: 0.9, fontSize: 13, color: SUBTLE });
  const x = 5.3, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15);
  label(s, "ตัวอย่างผล (2.23) · Q7S.5 ทำเครื่องหมายว่าตัดสต๊อกแล้ว", x, TOP - 0.05, w, BRAND);
  const q = RESULTS.find((r) => r.id === "Q7S.5");
  code(s, q.sql.replace(/\s+/g, " ").replace(" WHERE", "\nWHERE").replace(" SET", "\nSET"), x, TOP + 0.35, w, 1.1, 12);
  txt(s, `ค่าที่ส่งเข้า (params): ${JSON.stringify(q.params)}`.slice(0, 120), { x, y: TOP + 1.6, w, h: 0.4, fontFace: MONO, fontSize: 11, color: SUBTLE });
  txt(s, `ผลลัพธ์: ${q.affected != null ? q.affected + " แถวถูกแก้ไข" : ""}`, { x, y: TOP + 2.0, w, h: 0.4, fontSize: 14, bold: true });
  points(s, [["รันด้วยสคริปต์ในโฟลเดอร์ของเล่ม", "คำสั่ง npm run sql รันทุก query บน PGlite (PostgreSQL)\nเริ่มจากข้อมูลตั้งต้นชุดเดียวกัน"], ["SQL เดียวกับในโค้ด", "คัดลอกจากโค้ดของเว็บทุกข้อ และจดชื่อคู่กันไว้\nเทียบทีละข้อแล้วตรงกัน"]], x, TOP + 2.7, w, { mark: BRAND, gap: 1.2, size: 15, small: 13 });
  notes(s, 2, `SQL ทั้ง ${RESULTS.length} คำสั่งในเล่มรันจริงกับ PostgreSQL ผ่าน PGlite ทุกคำสั่งเริ่มจากข้อมูลตั้งต้นชุดเดียวกัน ผ่านทั้งหมด ตัวรันอยู่ในโฟลเดอร์เครื่องมือของเล่ม 04-chapter2-diagrams-database ด้วย npm run sql ไม่ได้อยู่ใน repo เว็บ ตารางผลใน 2.23 มีคำสั่ง ค่าที่ส่ง และผลลัพธ์ ตัวอย่างคือ Q7S.5 ที่ตั้ง stock_deducted SQL ทุกข้อคัดลอกจากค่าคงที่ในโค้ด และจดชื่อค่าคงที่คู่กันไว้ เทียบทีละข้อแล้วตรงกัน`);
}

// 53 Testing
{
  const s = content("Testing", "สิ่งที่ทดสอบแล้ว และสิ่งที่ยังไม่มี");
  panel(s, M - 0.2, TOP - 0.15, 2.6, 1.6, "tint");
  panel(s, M + 2.6, TOP - 0.15, 2.6, 1.6, "tint");
  stat(s, M, TOP, 2.2, `${TEST_OK}/${TESTS.length}`, "กรณีทดสอบบนเว็บจริง\nผ่านทั้งหมด");
  stat(s, M + 2.8, TOP, 2.2, `${new Set(TESTS.map((t) => t[0])).size} UC`, "ครบทุก Use Case\nทั้งกรณีปกติและผิดพลาด");
  panel(s, M - 0.2, TOP + 1.65, 5.4, BOTTOM - TOP - 1.65);
  label(s, "ตรวจอัตโนมัติในโค้ด", M, TOP + 1.8, 5, BRAND);
  txt(s, ["ตรวจรูปแบบโค้ด ชนิดข้อมูล และ build ผ่าน", "ลองสร้างฐานข้อมูลใหม่ในที่ชั่วคราว ได้ครบ 17 ตาราง", `SQL ${RESULTS.length} query รันผ่านสคริปต์ในโฟลเดอร์ของเล่ม`].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x: M, y: TOP + 2.15, w: 5.0, h: 1.6, fontSize: 13 });
  label(s, "ยังไม่มี", M, TOP + 3.8, 5, DANGER);
  txt(s, [{ text: "ทดสอบอัตโนมัติแบบ unit test และ e2e test", options: { breakLine: true } }, { text: `ทดสอบหน้าจอ ${TESTS.length} กรณีด้วยมือ ตามตารางใน 2.24` }], { x: M, y: TOP + 4.15, w: 5.0, h: 0.8, fontSize: 13.5 });
  const x = 6.2, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15);
  const pick = TESTS.filter((t) => ["test/3S-inhouse-ok.png", "test/6A-receive-ok.png", "test/1A-error.png", "test/7S-error.png", "test/5A-ok.png", "test/8A-error.png"].includes(t[5]));
  grid(s, [["UC", "กรณีทดสอบ", "ผล"], ...pick.map((t) => [t[0], t[2].replace(/`/g, ""), t[4]])], x, TOP - 0.05, [0.6, w - 1.3, 0.7], 0.45, { size: 12.5, boldCol: 0,
    style: (r, i, j) => (i && j === 2 ? { color: SUCCESS, bold: true } : {}) });
  label(s, "3S บริษัทส่งเอง · ORD-24194", x, TOP + 3.3, w, BRAND);
  img(s, PLT("test/3S-inhouse-ok.png"), x, TOP + 3.65, w, BOTTOM - TOP - 3.8, { align: "lt", frame: true });
  notes(s, 2, `การทดสอบมี ${TESTS.length} กรณีบนเว็บจริง ครอบคลุมทุก Use Case ทั้งกรณีปกติและผิดพลาด ผ่านทั้งหมด ข้อความที่คาดหวังคัดจาก Use Case Description คำต่อคำ กรณีระบบภายนอกล่มใช้หน้า /dev ในโค้ดมีการตรวจอัตโนมัติ lint, type check, build และ smoke test ของการ reset ฐานข้อมูล ส่วน SQL ทุกข้อรันด้วย npm run sql ในโฟลเดอร์เครื่องมือของเล่ม ส่วน unit test และ e2e test อัตโนมัติยังไม่มี เราบอกตรงๆ ว่าการทดสอบตามหน้าจอทำด้วยมือ`);
}

// 54 Live demo + SELECT: กดในเว็บ 1 ครั้ง SELECT ใน psql ก่อนและหลัง (ลำดับและ SQL ตามคู่มือหัวข้อเดโม ทดสอบบน db:reset แล้ว)
{
  const s = content("Live demo + SELECT", "กดในเว็บ แล้ว SELECT ใน psql ให้เห็นข้อมูลเปลี่ยนจริง");
  const lw = 6.55;
  panel(s, M - 0.2, TOP - 0.15, lw + 0.4, BOTTOM - TOP + 0.15);
  grid(s, [["#", "กดในเว็บ", "ผลที่ต้องเห็นหลัง SELECT"],
    ["1", "1A Login admin@colorado.jp", "sessions 0 → 1 แถว (เก็บ token_hash)"],
    ["2", "4A นำเข้า Order ที่ Dashboard", "รอตรวจสอบคำสั่งซื้อ 7 → 8"],
    ["3", "2A ยืนยัน ORD-24194", "รอพิมพ์ใบปะสินค้า, in_house, label ready"],
    ["4", "9A พิมพ์ใบปะ ORD-24194", "label printed + label_print_history 1 แถว"],
    ["5", "8A ส่งมอบ ORD-24194", "อยู่ระหว่างจัดส่ง, in_transit (ยังไม่ตัดสต๊อก)"],
    ["6", "5A คุ้มค่า ORD-24184", "รอสั่งซื้อจาก Supplier"]], M, TOP - 0.05, [0.4, 2.85, 3.3], 0.6, { size: 12.5, boldCol: 0 });
  label(s, "ก่อนพรี (พิมพ์ใน terminal)", M, TOP + 4.3, lw, BRAND);
  txt(s, [{ text: "docker start rsl-pg", options: { fontFace: MONO, color: TEXT } }, { text: "  เปิดฐานข้อมูล", options: { breakLine: true } },
    { text: "npm run db:reset", options: { fontFace: MONO, color: TEXT } }, { text: "  ล้างเป็นข้อมูลตั้งต้น   ", options: {} }, { text: "npm run dev", options: { fontFace: MONO, color: TEXT } }, { text: "  เปิดเว็บ", options: { breakLine: true } },
    { text: "พลาด → กด reset ที่หน้า /dev แล้วเริ่มใหม่ · เวลาไม่พอ ทำข้อ 1–3" }], { x: M, y: TOP + 4.62, w: lw, h: 0.75, fontSize: 12.5, color: SUBTLE });
  const x = M + lw + 0.6, w = W - M - x;
  panel(s, x - 0.2, TOP - 0.15, w + 0.4, BOTTOM - TOP + 0.15, "tint");
  label(s, "psql = โปรแกรมพิมพ์คำสั่ง SQL ของ PostgreSQL", x, TOP - 0.05, w, BRAND);
  code(s, ["-- เปิด psql เข้าฐานข้อมูลของเว็บ", "docker exec -it rsl-pg psql \\", "  -U rsl_app -d rsl_fulfillment_hub",
    "-- 1 session หลัง Login", "SELECT admin_id, expires_at, revoked_at", "FROM sessions;",
    "-- 2 นับ Order ตามสถานะ", "SELECT order_status, COUNT(*) FROM orders", "GROUP BY 1 ORDER BY 2 DESC;",
    "-- 3 4 5 สถานะ แหล่งส่ง ขนส่ง ใบปะ ของ ORD-24194", "SELECT o.order_id, o.order_status,", "  i.fulfill_source, o.tracking_number,", "  o.delivery_status, l.label_status",
    "FROM orders o JOIN order_items i USING (order_id)", "LEFT JOIN labels l USING (order_id)", "WHERE o.order_id = 'ORD-24194';",
    "-- 6 Order ที่รอตัดสินใจ / รอสั่งซื้อ", "SELECT order_id, order_status FROM orders", "WHERE order_status IN ('รอ Admin ตัดสินใจสั่งซื้อ',", "  'รอสั่งซื้อจาก Supplier');"].join("\n"), x, TOP + 0.3, w, BOTTOM - TOP - 0.4, 10.5);
  notes(s, 2, "[สลับไปเบราว์เซอร์และ terminal ที่เปิด psql ไว้] เดโมทุกขั้น SELECT ก่อนกดหนึ่งครั้งและหลังกดหนึ่งครั้ง 1 Login แล้ว SELECT sessions เห็นแถวใหม่ที่เก็บเฉพาะ hash ของ token 2 นำเข้า Order แล้วนับตามสถานะ รอตรวจสอบคำสั่งซื้อเพิ่มจาก 7 เป็น 8 3 ยืนยัน ORD-24194 SELECT order นี้ ระบบทำ 2S 3S 6S ต่อเองใน transaction เดียว สถานะเป็นรอพิมพ์ใบปะสินค้า fulfill_source เป็น in_house และมีใบปะ ready 4 พิมพ์ใบปะ label เป็น printed และมีประวัติการพิมพ์ 5 ส่งมอบ ได้เลขติดตาม delivery_status เป็น in_transit สต๊อกยังไม่ตัดเพราะ 7S ตัดหลัง 5S แจ้งเลขติดตาม 6 ตัดสินใจคุ้มค่าใน 5A Order เปลี่ยนเป็นรอสั่งซื้อจาก Supplier ถ้าอาจารย์ให้เขียน SELECT เอง เริ่มจาก SELECT * FROM ตาราง LIMIT 5 แล้วค่อยเติม WHERE หมายเหตุ เครื่องที่พรีใช้ container rsl-pg ถ้าใช้ PostgreSQL ที่ติดตั้งเอง ใช้ psql -U rsl_app -d rsl_fulfillment_hub แทน");
}

// 55 หน้าที่รับผิดชอบ (ข้อ 2.25) งานกับคะแนนตรงกับตาราง 2.25 และ 2.25.1 ในเล่ม
{
  const s = content("Team and responsibilities", "หน้าที่รับผิดชอบของสมาชิก");
  const WORK = [["Business Flow As-Is / To-Be", "ER Diagram", "CRUD (As-Is)", "Use Case Description", "Backend และ Database"],
    ["Business Flow As-Is / To-Be", "ER Diagram", "CRUD (To-Be), Query Table", "Use Case Description", "Backend และ Database"],
    ["ประสานงานกับเจ้าของกิจการ", "ผู้จัดทำรายงานหลัก", "Use Case Diagram", "Sequence, Collaboration", "UX/UI และ Frontend"]];
  const COUNT = [16, 17, 20];
  MEMBERS.forEach(([n, id], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP - 0.15, 3.95, BOTTOM - TOP + 0.15);
    s.addImage({ path: path.join(__dirname, "..", "assets", "members", `${id}.jpg`), x, y: TOP + 0.05, w: 1.0, h: 1.0 * 631 / 500 });
    txt(s, n, { x: x + 1.15, y: TOP + 0.1, w: 2.45, h: 0.45, fontSize: 16, bold: true, valign: "middle" });
    txt(s, id, { x: x + 1.15, y: TOP + 0.55, w: 2.45, h: 0.35, fontSize: 13, color: SUBTLE, valign: "middle" });
    if (i === 0) txt(s, "หัวหน้าทีม", { x: x + 1.15, y: TOP + 0.9, w: 2.45, h: 0.35, fontSize: 13, bold: true, color: BRAND });
    label(s, "งานที่รับผิดชอบ", x, TOP + 1.55, 3.6, BRAND);
    txt(s, WORK[i].map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x, y: TOP + 1.9, w: 3.6, h: 2.2, fontSize: 15, lineSpacingMultiple: 1.2, valign: "top" });
    [[String(COUNT[i]), "งานในเล่ม (ชิ้น)"], ["5/5", "คะแนนจากหัวหน้าทีม"]].forEach(([v, k], j) => {
      const bx = x + j * 1.85;
      txt(s, v, { x: bx, y: TOP + 4.25, w: 1.75, h: 0.55, fontSize: 26, bold: true, color: BRAND });
      txt(s, k, { x: bx, y: TOP + 4.8, w: 1.75, h: 0.35, fontSize: 12, color: SUBTLE });
    });
  });
  notes(s, 2, "ทีมมีสามคน หัวหน้าทีมคือธนภัทร ธนภัทรและอชิระทำ Business Flow ER CRUD Use Case Description และ Backend กับ Database ปิยากรประสานงานกับเจ้าของกิจการ เขียนรายงานหลัก ทำ Use Case Diagram Sequence Collaboration และ Frontend จำนวนงานต่อคนตามตาราง 2.25 คือ 16 17 และ 20 ชิ้น คะแนนจากหัวหน้าทีมได้ 5 เต็ม 5 ทุกคน");
}

// 56 สรุป
{
  const s = content("Summary", "สรุป");
  [["Before", ["งานมือประมาณ 1–2 ชม./วัน", "คำนวณต้นทุน 20–30 นาที/ครั้ง", "ตัดสินใจสั่งซื้อด้วยความรู้สึก"], DANGER], ["After", ["ระบบทำ 7 Use Case เอง", "ใบปะพร้อมทันทีหลังยืนยัน", "ต้นทุนจากสูตรเดียว", "เจ้าของยังอนุมัติทุกการสั่งซื้อ"], BRAND],
   ["Next", ["ต่อ Rakuten RMS API และ RSL จริง", "เพิ่มตัวตั้งเวลาและทดสอบอัตโนมัติ", "ขยายไป Yahoo! Auctions และ Amazon"], SUBTLE]].forEach(([h, d, c], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, TOP + 0.1, 4.0, 3.0);
    s.addShape(pres.shapes.RECTANGLE, { x, y: TOP + 0.3, w: 3.8, h: 0.08, fill: { color: c === DANGER ? CORAL : c }, line: { color: c === DANGER ? CORAL : c } });
    txt(s, h, { x, y: TOP + 0.6, w: 3.8, h: 0.7, fontSize: 30, bold: true, color: c });
    txt(s, d.map((t) => ({ text: t, options: { bullet: true, breakLine: true } })), { x, y: TOP + 1.4, w: 3.7, h: 1.6, fontSize: 15, lineSpacingMultiple: 1.1 });
  });
  panel(s, M - 0.2, 4.75, W - 2 * M + 0.4, 0.9, "tint");
  txt(s, "ระบบรับงานซ้ำ แต่ทุกการสั่งซื้อที่ใช้เงินจริงต้องผ่านการอนุมัติของเจ้าของ", { x: M, y: 4.75, w: W - 2 * M, h: 0.9, fontSize: 20, bold: true, color: BRAND, valign: "middle" });
  // ตัวเลขสรุปงานทั้งเล่ม เติมพื้นที่ล่างให้เห็นขนาดงาน
  [[String(UCS.length), "Use Case Description"], [String(N_TABLES), "ตารางในฐานข้อมูล"],
   [`${SQL_OK}/${RESULTS.length}`, "SQL รันผ่าน"], [`${TEST_OK}/${TESTS.length}`, "กรณีทดสอบผ่าน"]].forEach(([big, sub], i) => {
    const x = M + i * 3.08;
    if (i) s.addShape(pres.shapes.LINE, { x: x - 0.25, y: 5.95, w: 0, h: 0.85, line: { color: BORDER, width: 0.75 } });
    txt(s, big, { x, y: 5.85, w: 2.8, h: 0.6, fontSize: 32, bold: true, color: TEXT });
    txt(s, sub, { x, y: 6.45, w: 2.8, h: 0.35, fontSize: 14, color: SUBTLE });
  });
  notes(s, 2, `สรุป เดิมเจ้าของใช้เวลาประมาณ 1 ถึง 2 ชั่วโมงต่อวันกับงานมือ ระบบใหม่ทำ 7 Use Case เอง ใบปะพร้อมทันทีหลังยืนยัน Order ต้นทุนคำนวณด้วยสูตรเดียว แต่เจ้าของยังอนุมัติทุกการสั่งซื้อ งานในเล่มมี ${UCS.length} Use Case, ${N_TABLES} ตาราง, SQL ${RESULTS.length} ข้อรันผ่านทั้งหมด และทดสอบ ${TESTS.length} กรณีผ่านทั้งหมด ขั้นต่อไปคือต่อ API จริงแทนตัวจำลอง เพิ่มตัวตั้งเวลาและ test อัตโนมัติ แล้วขยายช่องทางขาย`);
}

// 57 ถาม-ตอบ: แถบเข้มแบบปก ด้านล่างสรุปสิ่งที่ระบบทำได้ ให้ค้างไว้ระหว่างตอบคำถาม
{
  const s = pres.addSlide({ masterName: "PLAIN" });
  s.background = { color: PAGE };
  const BH = 3.9;
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: BH, fill: { color: BAND }, line: { color: BAND, width: 0 } });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 1.3, w: 0.08, h: 1.25, fill: { color: CORAL }, line: { color: CORAL, width: 0 } });
  txt(s, [{ text: "Q&A" }, { text: ".", options: { color: CORAL } }], { x: M + 0.28, y: 1.1, w: 6, h: 1.6, fontSize: 80, bold: true, color: WHITE, valign: "middle" });
  txt(s, "ขอบคุณครับ/ค่ะ  ยินดีตอบคำถาม", { x: M + 0.28, y: 2.8, w: 7, h: 0.5, fontSize: 22, color: ON_DARK });
  txt(s, "Colorado Back-Office System", { x: 7.5, y: 1.3, w: W - 7.5 - M, h: 0.4, fontSize: 16, bold: true, color: WHITE, align: "right" });
  MEMBERS.forEach(([n, id], i) => txt(s, `${n}  ${id}`, { x: 7.5, y: 1.85 + i * 0.4, w: W - 7.5 - M, h: 0.35, fontSize: 13, color: ON_DARK_2, align: "right" }));

  [["01", "Auto label", "ใบปะพร้อมพิมพ์ทันที\nเมื่อรู้ว่าส่งจาก RSL หรือคลังบริษัท"],
   ["02", "Auto reorder", "เช็กสต๊อก 2 คลัง\nเจ้าของอนุมัติสั่งซื้อและรับของ"],
   ["03", "Unit cost", "ต้นทุนต่อหน่วยจากสูตรเดียวกันทุกครั้ง\nพร้อมเก็บประวัติ"]].forEach(([n, h, d], i) => {
    const x = M + i * 4.1;
    panel(s, x - 0.2, 4.4, 3.95, 2.3);
    txt(s, n, { x, y: 4.6, w: 3.6, h: 0.6, fontSize: 30, bold: true, color: BRAND });
    txt(s, h, { x, y: 5.25, w: 3.6, h: 0.45, fontSize: 20, bold: true });
    txt(s, d, { x, y: 5.75, w: 3.6, h: 0.8, fontSize: 14, color: SUBTLE });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 7.17, w: 0.05, h: 0.2, fill: { color: CORAL }, line: { color: CORAL, width: 0 } });
  txt(s, COURSE, { x: M + 0.15, y: 7.1, w: 8, h: 0.34, fontSize: 12, color: SUBTLE, valign: "middle" });
  txt(s, `${TOTAL} / ${TOTAL}`, { x: W - M - 0.85, y: 7.1, w: 0.85, h: 0.34, fontSize: 12, bold: true, color: SUBTLE, align: "right", valign: "middle" });
  notes(s, 2, "ขอบคุณค่ะ เปิดให้ถามคำถาม (ดูคำตอบที่เตรียมไว้ใน qna_prep/qna-Colorado.pdf)");
}

if (pres.slides.length !== TOTAL) throw new Error(`จำนวนสไลด์ ${pres.slides.length} ไม่ตรงกับ TOTAL ${TOTAL}`);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
pres.writeFile({ fileName: OUT }).then(() => console.log("saved", OUT, `${TOTAL} slides`));
