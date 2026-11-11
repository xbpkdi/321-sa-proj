"""สร้างไฟล์ต้นฉบับของรูป 2.14-2.19 ลง diagrams/src/
ใช้: cd 04-chapter2-diagrams-database && npm run dict && python3 diagrams/gen_diagrams.py && npm run diagrams

Class Diagram อ่าน object และ method จาก Sequence/Collaboration ของทุก UC
ER Diagram อ่านคอลัมน์และ key จาก sql/dictionary.json, query จาก sql/queries.json
"""
import json
import os
import re
from collections import OrderedDict, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
SRC = os.path.join(HERE, "src")
MMD = os.path.join(ROOT, "03-chapter2-use-case-descriptions", "diagrams", "mmd")
DICT = json.load(open(os.path.join(HERE, "..", "sql", "dictionary.json"), encoding="utf-8"))
QUERIES = json.load(open(os.path.join(HERE, "..", "sql", "queries.json"), encoding="utf-8"))
os.makedirs(SRC, exist_ok=True)

UCS = ["1A", "2A", "3A", "4A", "5A", "6A", "7A", "8A", "9A", "10A", "1S", "2S", "3S", "4S", "5S", "6S", "7S"]
EXTERNAL = {"Admin", "Super Admin", "Marketplace", "Supplier", "Delivery"}


def write(name, text):
    with open(os.path.join(SRC, name), "w", encoding="utf-8") as f: f.write(text)


# ------------------------------------------------------------------ Class Diagram
# คลาสมาจาก object ใน Sequence Diagram ซึ่งตรงกับโค้ดจริง: Screen (page, ชั้น View ของ MVC) -> Controller (Server Action ใน actions.ts)
# -> use-case -> โมดูล queries -> db.ts และ adapter ของระบบภายนอก
methods = defaultdict(set)
umethods = defaultdict(set)  # (uc, class) -> method ที่ใช้ใน UC นั้น
uc_objs = defaultdict(set)
calls = defaultdict(set)  # class -> classes ที่เรียกใช้
files = {}  # class -> ไฟล์ในโค้ด
for uc in UCS:
    seq = open(os.path.join(MMD, f"{uc}-sequence.mmd"), encoding="utf-8").read()
    col = open(os.path.join(MMD, f"{uc}-collaboration.mmd"), encoding="utf-8").read()
    alias = {}
    for m in re.finditer(r"^\s*(?:actor|participant)\s+(\w+)(?:\s+as\s+(.+))?$", seq, re.M):
        full = (m.group(2) or m.group(1)).strip().lstrip(":")
        alias[m.group(1)] = full.split(" (")[0].split(" /")[0]
        f = re.search(r"\(([^)]+)\)", full)
        if f: files.setdefault(alias[m.group(1)], f.group(1))
        uc_objs[uc].add(alias[m.group(1)])
    for src, dst, msg in re.findall(r"^\s*(\w+)->>[+-]?(\w+):\s*(\w+)\(", seq, re.M):
        a, b = alias.get(src), alias.get(dst)
        if not a or not b or b in EXTERNAL: continue
        methods[b].add(msg); umethods[(uc, b)].add(msg)
        if a != b and a not in EXTERNAL: calls[a].add(b)
    for m in re.finditer(r'^\s*\w+\["([^"<]+)((?:<br/>[^"]*)?)"\]', col, re.M):
        name = m.group(1).strip().split(" (")[0]
        found = set(re.findall(r"\+(\w+)\(", m.group(2)))
        methods[name] |= found; umethods[(uc, name)] |= found

KINDS = ["screen", "action", "usecase", "queries", "db", "adapter"]
kind = lambda c: ("screen" if c.endswith("Screen") else "action" if c.endswith("Controller") else "usecase" if c.endswith("UseCase") or c in ("ExecuteWorkflow", "SessionAuth")
                  else "queries" if c.endswith("Queries") else "db" if c == "DBConnector" else "adapter")
classes = sorted((c for c in methods if c not in EXTERNAL), key=lambda c: (KINDS.index(kind(c)), c))
# ค่าคงที่ SQL ของแต่ละโมดูล queries จาก qmap ใน usecases.json ("orders.ts · Q2A_1")
CONSTS = defaultdict(set)
for q in QUERIES:
    if q.get("code"):
        f, const = [x.strip() for x in q["code"].split("·")]
        CONSTS[(q["uc"], f)].add(const)


def class_block(c, group=None):
    k = kind(c)
    attrs = []
    if k == "screen": attrs = [f"-route: string = \"{files.get(c, '')}\""] if files.get(c, "").startswith("/") else []
    elif k == "usecase": attrs = ["-client: PoolClient"]
    elif k == "queries": attrs = [f"+{x}: SQL" for x in sorted(set().union(*(CONSTS[(u, files.get(c, ""))] for u in (group or UCS))))]
    elif k == "db": attrs = ["-pool: Pool"]
    stereo = {"screen": "<<Screen>>", "action": "<<Controller>>", "adapter": "<<interface>>", "queries": "<<module>>"}.get(k)
    lines = ([stereo] if stereo else []) + attrs + [f"+{m}()" for m in sorted(set().union(*(umethods[(u, c)] for u in group)) if group else methods[c])]
    return f"    class {c} {{\n" + "\n".join(f"        {x}" for x in lines) + "\n    }\n"


INIT = "%%{init: {'class': {'hideEmptyMembersBox': true}, 'themeVariables': {'fontSize': '15px'}}}%%\n"
screens = [c for c in classes if kind(c) == "screen"]
usecases_ = [c for c in classes if kind(c) == "usecase"]
qmods = [c for c in classes if kind(c) == "queries"]
adapters = [c for c in classes if kind(c) == "adapter"]

CLASS_GROUPS = [  # แบ่งรูปตามกลุ่มงาน กลุ่มละไม่เกิน 2 Use Case ให้ตัวอักษรอ่านได้
    ("เข้าสู่ระบบ", ["1A"]),
    ("รับคำสั่งซื้อและจับคู่ SKU", ["4A", "2S"]),
    ("ตรวจสอบและยกเลิกคำสั่งซื้อ", ["2A", "7A"]),
    ("จัดการสินค้า", ["3A"]),
    ("ตรวจและตัดสต๊อก", ["3S", "7S"]),
    ("คำนวณต้นทุน", ["4S"]),
    ("ตัดสินใจสั่งซื้อเติม stock", ["5A"]),
    ("สั่งซื้อเติม stock จาก supplier", ["6A"]),
    ("ส่ง Order เข้า RSL", ["1S"]),
    ("จัดการใบปะ", ["6S", "9A"]),
    ("จัดส่งและแจ้งเลขติดตาม", ["8A", "5S"]),
    ("ลบข้อมูลเก่า", ["10A"]),
]
for n, (title, group) in enumerate(CLASS_GROUPS, 1):
    objs = set().union(*(uc_objs[u] for u in group)) - EXTERNAL
    g = [c for c in classes if c in objs]
    out = INIT + "classDiagram\n    direction LR\n"
    for c in g: out += class_block(c, group)
    if any(kind(c) == "adapter" for c in g):
        out += "    class MockAdapters {\n        <<mock.ts>>\n        -faults: FaultFlags\n    }\n"
    for c in g:
        for d in sorted(calls[c]):
            if d not in g or kind(d) == "db": continue
            if kind(c) == "screen" and kind(d) == "action": out += f"    {c} \"1\" --> \"1\" {d} : calls\n"
            else: out += f"    {c} ..> {d}\n"
    for c in g:
        if kind(c) == "queries": out += f"    {c} o-- DBConnector : pool\n" if "DBConnector" in g else ""
        if kind(c) == "adapter": out += f"    {c} <|.. MockAdapters\n"
    write(f"class-{n}.mmd", out)

# entity class (ตรงกับตารางในฐานข้อมูล) แบ่งรูปเหมือน ER Diagram ตารางนอกกลุ่มแสดงแค่ชื่อ
ENTITY_PARTS = [
    ["orders", "order_items", "labels", "tracking_notification_logs", "label_print_history", "deletion_history"],
    ["admins", "sessions", "auto_error_logs", "cost_history", "stock_adjustment_history"],
    ["skus", "stock", "rakuten_stock_sync_states", "costs", "reorders", "suppliers"],
]
cname = lambda t: "".join(w.capitalize() for w in t.split("_"))
CRUD_METHOD = {"C": "+create()", "R": "+find()", "U": "+update()", "D": "+delete()"}


def entity_methods(table):
    # method ของ entity มาจากคำสั่ง SQL ที่ใช้กับตารางนั้นจริงใน Use Case Description
    used = set("".join(q["ops"].get(table, "") for q in QUERIES))
    ms = [m for k, m in CRUD_METHOD.items() if k in used]
    if any("order_status" in q["sets"].get(table, []) for q in QUERIES): ms.append("+changeStatus(status)")
    return "\n".join(f"        {m}" for m in ms)
FK = []
for d in DICT:
    for c in d["columns"]:
        for ref in re.findall(r"FK → (\w+)", c["key"]):
            if (ref, d["table"]) not in FK: FK.append((ref, d["table"]))
for n, part in enumerate(ENTITY_PARTS, 1):
    out = INIT + "classDiagram\n    direction " + ("LR" if n == 1 else "TB") + "\n"
    for d in DICT:
        if d["table"] not in part: continue
        # mermaid มองบรรทัดที่มี () เป็น method จึงใช้วงเล็บ ❨❩ แทนใน type เช่น VARCHAR(10)
        cols = "\n".join(f"        -{c['name']}: {c['type'].replace('(', '❨').replace(')', '❩')}" for c in d["columns"])
        out += f"    class {cname(d['table'])} {{\n{cols}\n{entity_methods(d['table'])}\n    }}\n"
    for ref, t in FK:
        if ref not in part and t not in part: continue
        one = t in ("stock", "rakuten_stock_sync_states")
        out += f"    {cname(ref)} \"1\" -- \"{'1' if one else '0..*'}\" {cname(t)}\n"
    write(f"class-{len(CLASS_GROUPS) + n}.mmd", out)

# ------------------------------------------------------------------ State Diagram ของ Order
S = OrderedDict()
def st(name):
    if name not in S: S[name] = f"s{len(S) + 1}"
    return S[name]
T = [  # ตรงกับโค้ด (src/lib/use-cases, queries) ทุกเส้น เลข Q คือเลขใน Use Case Description
    ("[*]", "รอตรวจสอบคำสั่งซื้อ", "[ข้อมูลครบ ไม่ซ้ำ] importOrders / 4A (Q4A.5)"),
    ("[*]", "รอดำเนินการด้วยตนเอง", "[ไม่พบ SKU] importOrders / 4A (Q4A.5)"),
    ("รอตรวจสอบคำสั่งซื้อ", "รอจับคู่กฎ SKU", "[ข้อมูลครบ] verifyOrder / 2A (Q2A.3)"),
    ("รอตรวจสอบคำสั่งซื้อ", "รอดำเนินการด้วยตนเอง", "[ข้อมูลไม่ครบ] verifyOrder / 2A (Q2A.3)"),
    ("รอตรวจสอบคำสั่งซื้อ", "ยกเลิกแล้ว", "[ลูกค้ายกเลิกใน Rakuten] verifyOrder / 2A (Q2A.3)"),
    ("รอจับคู่กฎ SKU", "รอตรวจสอบสต๊อก", "[พบกฎ SKU 1 รายการ] matchSku / 2S (Q2S.3)"),
    ("รอจับคู่กฎ SKU", "รอดำเนินการด้วยตนเอง", "[ไม่พบหรือพบหลายกฎ] matchSku / 2S (Q2S.3)"),
    ("รอดำเนินการด้วยตนเอง", "รอจับคู่กฎ SKU", "[บันทึก SKU สำเร็จ] saveProduct / 3A (Q3A.8)"),
    ("รอตรวจสอบสต๊อก", "ยังไม่ได้จับคู่", "[RSL พอ] checkStock / 3S (Q3S.4)"),
    ("รอตรวจสอบสต๊อก", "รอจัดรูปแบบใบปะสินค้า", "[RSL ไม่พอ คลังบริษัทพอ] checkStock / 3S (Q3S.4)"),
    ("รอตรวจสอบสต๊อก", "รอ Admin ตัดสินใจสั่งซื้อ", "[ไม่มีแหล่งใดพอ] checkStock / 3S (Q3S.4)"),
    ("รอ Admin ตัดสินใจสั่งซื้อ", "รอสั่งซื้อจาก Supplier", "[คุ้มค่า] decideReorder / 5A (Q5A.2)"),
    ("รอ Admin ตัดสินใจสั่งซื้อ", "รอยกเลิก Order", "[ไม่คุ้มค่า] decideReorder / 5A (Q5A.2)"),
    ("รอสั่งซื้อจาก Supplier", "รอส่งคำสั่งซื้อ", "purchaseReorder / 6A (Q6A.8)"),
    ("รอส่งคำสั่งซื้อ", "สั่งซื้อแล้ว", "[Supplier รับคำสั่งซื้อ] purchaseReorder / 6A (Q6A.8)"),
    ("สั่งซื้อแล้ว", "รอตรวจสอบสต๊อก", "[ได้รับสินค้า] receiveReorder / 6A (Q6A.14)"),
    ("สั่งซื้อแล้ว", "รอ Admin ตัดสินใจสั่งซื้อ", "[ยกเลิกคำสั่งซื้อจาก Order อื่น] cancelOrder / 7A (Q7A.5)"),
    ("รอส่งคำสั่งซื้อ", "รอ Admin ตัดสินใจสั่งซื้อ", "[ยกเลิกคำสั่งซื้อจาก Order อื่น] cancelOrder / 7A (Q7A.5)"),
    ("รอยกเลิก Order", "ยกเลิกแล้ว", "cancelOrder / 7A (Q7A.2)"),
    ("ยังไม่ได้จับคู่", "รอจัดรูปแบบใบปะสินค้า", "[พบเลข RSL] matchRsl / 1S (Q1S.3)"),
    ("รอจัดรูปแบบใบปะสินค้า", "รอพิมพ์ใบปะสินค้า", "[สร้างใบปะสำเร็จ] formatLabels / 6S (Q6S.5)"),
    ("รอจัดรูปแบบใบปะสินค้า", "รอดำเนินการด้วยตนเอง", "[ไม่พบ template] formatLabels / 6S (Q6S.3)"),
    ("รอจัดรูปแบบใบปะสินค้า", "ยังไม่ได้จับคู่", "[จับคู่ RSL ผิด] unmatchRsl / 1S (Q1S.4)"),
    ("รอพิมพ์ใบปะสินค้า", "ยังไม่ได้จับคู่", "[จับคู่ RSL ผิด] unmatchRsl / 1S (Q1S.4)"),
    ("รอดำเนินการด้วยตนเอง", "ยังไม่ได้จับคู่", "[มีเลข RSL และจับคู่ผิด] unmatchRsl / 1S (Q1S.4)"),
    ("รอพิมพ์ใบปะสินค้า", "พิมพ์ใบปะสินค้าแล้ว", "[พิมพ์สำเร็จ] printLabel / 9A (Q9A.4)"),
    ("พิมพ์ใบปะสินค้าแล้ว", "อยู่ระหว่างจัดส่ง", "[ได้เลขติดตาม] dispatchOrder / 8A (Q8A.2)"),
    ("พิมพ์ใบปะสินค้าแล้ว", "รอส่งมอบ", "[ยังไม่ได้เลขติดตาม] dispatchOrder / 8A (Q8A.6)"),
    ("รอส่งมอบ", "อยู่ระหว่างจัดส่ง", "[ได้เลขติดตาม] dispatchOrder / 8A (Q8A.2)"),
    ("อยู่ระหว่างจัดส่ง", "แจ้งเลขติดตามแล้ว", "[Rakuten รับเลขติดตาม] notifyTracking / 5S (Q5S.4)"),
    ("อยู่ระหว่างจัดส่ง", "รอแจ้งเลขติดตาม", "[ส่งเลขไม่สำเร็จ] notifyTracking / 5S (Q5S.4)"),
    ("รอแจ้งเลขติดตาม", "แจ้งเลขติดตามแล้ว", "[ส่งซ้ำสำเร็จ] notifyTracking / 5S (Q5S.4)"),
    ("อยู่ระหว่างจัดส่ง", "จัดส่งไม่สำเร็จ", "[ขนส่งแจ้ง failed] pollCarrier / 8A (Q8A.4)"),
    ("อยู่ระหว่างจัดส่ง", "ตีกลับ/คืนสินค้า", "[ขนส่งแจ้ง returned] pollCarrier / 8A (Q8A.4)"),
    ("อยู่ระหว่างจัดส่ง", "รอดำเนินการพิเศษ", "[ขอยกเลิกหลังส่งมอบ] cancelOrder / 7A (Q7A.2)"),
    ("แจ้งเลขติดตามแล้ว", "รอดำเนินการด้วยตนเอง", "[ตัดสต๊อกไม่ได้] deductStock / 7S (Q7S.3)"),
    ("แจ้งเลขติดตามแล้ว", "จัดส่งสำเร็จ", "[delivered และแจ้งเลขแล้ว และตัดสต๊อกครบทุกรายการ] deductStock / 7S (Q7S.7)"),
    ("ยังไม่ได้จับคู่", "ยกเลิกแล้ว", "[ยังไม่ส่งมอบ] cancelOrder / 7A (Q7A.2)"),
    ("จัดส่งสำเร็จ", "[*]", "deleteOldData / 10A (Q10A.1)"),
    ("ยกเลิกแล้ว", "[*]", "deleteOldData / 10A (Q10A.1)"),
]
for a, b, _ in T: [st(n) for n in (a, b) if n != "[*]"]


UC_NAME = {u["id"]: u["name"].split(" (")[0] for u in json.load(open(os.path.join(ROOT, "report-doc", "content", "usecases.json"), encoding="utf-8"))}


def action(label):
    # action ต้องเป็นชื่อ Use Case: "/ 2A (Q2A.4)" -> "/ ตรวจสอบคำสั่งซื้อ (Q2A.4)"
    return re.sub(r"/ (\d+[AS])\b", lambda m: "/ " + UC_NAME[m.group(1)], label)


def state_mmd(name, title, rows, direction="TB"):
    used = [n for n in S if any(n in (a, b) for a, b, _ in rows)]
    decl = "".join(f'        state "Order.{n}" as {S[n]}\n' for n in used)
    body = "".join(f"        {S.get(a, a)} --> {S.get(b, b)} : {action(lab)}\n" for a, b, lab in rows)
    write(name, "%%{init: {'themeVariables': {'fontSize': '15px'}}}%%\nstateDiagram-v2\n    direction " + direction + "\n"
          f'    state "{title}" as Order {{\n' + (f"        direction {direction}\n" if direction != "TB" else "") + f'{decl}{body}    }}\n')


# รูปรวมใช้ในสไลด์ ในเล่มแบ่ง 2 รูปที่สถานะ "ยังไม่ได้จับคู่" ให้ตัวหนังสืออ่านได้
SHIP = T.index(next(t for t in T if t[0] == "ยังไม่ได้จับคู่" and t[1] != "ยกเลิกแล้ว"))
after = [t for t in T[SHIP:] if t[0] != "ยกเลิกแล้ว"]
state_mmd("state.mmd", "Order (order_status)", T)
state_mmd("state-1.mmd", "Order (order_status) ก่อนจัดส่ง", [t for t in T if t not in after or t[0] == "ยังไม่ได้จับคู่" and t[1] == "ยกเลิกแล้ว"])
ship_rows = [("[*]", "ยังไม่ได้จับคู่", "ต่อจากรูปก่อนหน้า (RSL จัดส่ง)"), ("[*]", "รอจัดรูปแบบใบปะสินค้า", "ต่อจากรูปก่อนหน้า (บริษัทจัดส่งเอง)")] + [t for t in after if t[1] != "ยกเลิกแล้ว"]
state_mmd("state-2.mmd", "Order (order_status) ช่วงจัดส่ง", ship_rows)

# สไลด์: รูปช่วงจัดส่งสูงเกินจอ แบ่งอีก 3 รูปแนวนอน ให้ตัวหนังสือใหญ่พอฉาย
PRINT = {"รอพิมพ์ใบปะสินค้า", "พิมพ์ใบปะสินค้าแล้ว", "รอส่งมอบ"}
NOTIFY = {"อยู่ระหว่างจัดส่ง", "รอแจ้งเลขติดตาม", "แจ้งเลขติดตามแล้ว", "จัดส่งสำเร็จ"}
state_mmd("state-2a.mmd", "Order (order_status) จับคู่ RSL และจัดรูปแบบใบปะ", [t for t in ship_rows if t[0] not in PRINT | NOTIFY], "LR")
state_mmd("state-2b.mmd", "Order (order_status) พิมพ์ใบปะและส่งมอบ",
          [("[*]", "รอพิมพ์ใบปะสินค้า", "ต่อจากรูปก่อนหน้า")] + [t for t in ship_rows if t[0] in PRINT], "LR")
state_mmd("state-2c.mmd", "Order (order_status) แจ้งเลขติดตามและตัดสต๊อก",
          [("[*]", "อยู่ระหว่างจัดส่ง", "ต่อจากรูปก่อนหน้า (ส่งมอบแล้ว)")] + [t for t in ship_rows if t[0] in NOTIFY], "LR")

# State Diagram ของคอลัมน์สถานะอื่นที่โค้ดอัปเดต (ตรวจกับ src/lib/queries และ use-cases)
OTHER_STATES = {
    "state-reorder": ("Reorder", "Reorder (reorder_status)", [
        ("[*]", "รอส่งคำสั่งซื้อ", "[ไม่มีคำสั่งซื้อค้าง] purchaseReorder / 6A (Q6A.7)"),
        ("รอส่งคำสั่งซื้อ", "สั่งซื้อแล้ว", "[Supplier รับคำสั่งซื้อ] purchaseReorder / 6A (Q6A.9)"),
        ("รอส่งคำสั่งซื้อ", "รอส่งคำสั่งซื้อ", "[ส่งไม่สำเร็จ] purchaseReorder / 6A (Q6A.9)"),
        ("สั่งซื้อแล้ว", "ได้รับสินค้าแล้ว", "[ได้รับสินค้า] receiveReorder / 6A (Q6A.11)"),
        ("รอส่งคำสั่งซื้อ", "ยกเลิกแล้ว", "[ยกเลิกคำสั่งซื้อพร้อม Order] cancelOrder / 7A (Q7A.4)"),
        ("สั่งซื้อแล้ว", "ยกเลิกแล้ว", "[ยกเลิกคำสั่งซื้อพร้อม Order] cancelOrder / 7A (Q7A.4)"),
        ("สั่งซื้อแล้ว", "[*]", "[เลยวันที่คาดว่าจะได้รับ] deleteOldData / 10A (Q10A.4)"),
        ("ได้รับสินค้าแล้ว", "[*]", "deleteOldData / 10A (Q10A.4)"),
        ("ยกเลิกแล้ว", "[*]", "deleteOldData / 10A (Q10A.4)"),
    ]),
    "state-label": ("Label", "Label (label_status)", [
        ("[*]", "ready", "[สร้างใบปะสำเร็จ] formatLabels / 6S (Q6S.4)"),
        ("ready", "printed", "[พิมพ์สำเร็จ] printLabel / 9A (Q9A.4)"),
        ("ready", "[*]", "[ยกเลิกการจับคู่ RSL] unmatchRsl / 1S (Q1S.4)"),
        ("printed", "[*]", "[Order จัดส่งสำเร็จหรือยกเลิกแล้ว] deleteOldData / 10A (Q10A.2)"),
    ]),
    "state-sku": ("SKU", "SKU (sku_status)", [
        ("[*]", "active", "[เปิดขาย] saveProduct / 3A (Q3A.6)"),
        ("[*]", "inactive", "[ปิดขาย] saveProduct / 3A (Q3A.6)"),
        ("active", "inactive", "[ปิดการขาย] setProductActive / 3A (Q3A.9)"),
        ("inactive", "active", "[เปิดการขาย] setProductActive / 3A (Q3A.9)"),
        ("active", "[*]", "[ไม่มีข้อมูลที่อ้างถึง] deleteProduct / 3A (Q3A.11)"),
        ("inactive", "[*]", "[ไม่มีข้อมูลที่อ้างถึง] deleteProduct / 3A (Q3A.11)"),
    ]),
    "state-delivery": ("Order", "Order (delivery_status)", [
        ("[*]", "in_transit", "[ได้เลขติดตาม] dispatchOrder / 8A (Q8A.2)"),
        ("in_transit", "delivered", "[ขนส่งแจ้ง delivered] pollCarrier / 8A (Q8A.4)"),
        ("in_transit", "failed", "[ขนส่งแจ้ง failed] pollCarrier / 8A (Q8A.4)"),
        ("in_transit", "returned", "[ขนส่งแจ้ง returned] pollCarrier / 8A (Q8A.4)"),
        ("delivered", "[*]", "[Order จัดส่งสำเร็จ] deleteOldData / 10A (Q10A.1)"),
    ]),
    "state-sync": ("RakutenStockSyncState", "RakutenStockSyncState (sync_status)", [
        ("[*]", "pending", "[ปรับยอดสต๊อก] adjustStock / 3S (Q3S.8)"),
        ("[*]", "pending", "[รับสินค้าเข้าคลัง] receiveReorder / 6A (Q6A.12)"),
        ("[*]", "pending", "[ตัดสต๊อก] deductStock / 7S (Q7S.6)"),
        ("pending", "synced", "[Rakuten รับยอดคงเหลือ] syncRakutenStock / 7S (Q7S.10)"),
        ("pending", "pending", "[ส่งไม่สำเร็จ] syncRakutenStock / 7S (Q7S.11)"),
        ("synced", "pending", "[ปรับยอดสต๊อก] adjustStock / 3S (Q3S.8)"),
        ("synced", "pending", "[รับสินค้าเข้าคลัง] receiveReorder / 6A (Q6A.12)"),
        ("synced", "pending", "[ตัดสต๊อก] deductStock / 7S (Q7S.6)"),
        ("pending", "[*]", "[ลบสินค้า] deleteProduct / 3A (Q3A.11)"),
        ("synced", "[*]", "[ลบสินค้า] deleteProduct / 3A (Q3A.11)"),
    ]),
}
for name, (cls, title, rows) in OTHER_STATES.items():
    ids = OrderedDict((n, f"s{i + 1}") for i, n in enumerate(dict.fromkeys(n for a, b, _ in rows for n in (a, b) if n != "[*]")))
    decl = "".join(f'        state "{cls}.{n}" as {k}\n' for n, k in ids.items())
    body = "".join(f"        {ids.get(a, a)} --> {ids.get(b, b)} : {action(lab)}\n" for a, b, lab in rows)
    write(name + ".mmd", "%%{init: {'themeVariables': {'fontSize': '15px'}}}%%\nstateDiagram-v2\n    direction TB\n"
          f'    state "{title}" as {cls}Box {{\n{decl}{body}    }}\n')

# ------------------------------------------------------------------ Component Diagram
pairs = lambda names, k=2: "<br/>".join(", ".join(names[i:i + k]) for i in range(0, len(names), k))
write("component.mmd", f"""%%{{init: {{'flowchart': {{'nodeSpacing': 40, 'rankSpacing': 55, 'wrappingWidth': 700}}, 'themeVariables': {{'fontSize': '15px'}}}}}}%%
flowchart TB
    Admin(["Admin"])
    subgraph FE["«component» FrontEnd (Next.js 16 App Router, React 19)"]
        direction LR
        Pages["«component» Screens (page.tsx)<br/>{pairs(screens, 3)}"]
        UILib["«library» shadcn/ui, Radix UI<br/>TanStack Table, Recharts<br/>Tailwind CSS, Sonner, Lucide"]
    end
    subgraph BE["«component» BackEnd (Next.js Server, TypeScript)"]
        direction TB
        Act["«component» Controllers (Server Actions)<br/>src/app/(app)/actions.ts, login/actions.ts"]
        UCs["«component» Use Cases (src/lib/use-cases)<br/>{pairs(usecases_, 3)}"]
        Qs["«component» Queries (src/lib/queries)<br/>SQL constants Q&lt;UC&gt;_n<br/>{pairs(qmods, 3)}"]
        Conn["«component» DBConnector<br/>src/lib/db.ts, node-postgres (pg)"]
        Adp["«component» Adapters (src/lib/adapters)<br/>{pairs(adapters, 3)}<br/>mock implementation"]
    end
    DB[("«database» PostgreSQL<br/>17 tables")]
    RMS["«external» Rakuten RMS"]
    RSL["«external» RSL"]
    Carrier["«external» Delivery (Carrier)"]
    Printer["«device» Label Printer"]
    Supplier["«external» Supplier"]

    Admin -->|"HTTPS + session cookie"| Pages
    Pages -. uses .-> UILib
    Pages -->|"Server Action call"| Act
    Act -->|"withTransaction()"| UCs
    UCs -->|"executeWorkflow() 2S 3S 6S 7S"| UCs
    UCs -->|"query helpers"| Qs
    Qs -->|"query(sql, params)"| Conn
    Conn -->|"SQL"| DB
    UCs -->|"ExternalAdapters"| Adp
    Adp -.->|"orders, tracking, stock"| RMS
    Adp -.->|"RSL no, stock"| RSL
    Adp -.->|"delivery status"| Carrier
    Adp -.->|"print"| Printer
    Adp -.->|"purchase order"| Supplier
""")

# ------------------------------------------------------------------ ER Diagram (Chen) และ ER พร้อม Query
TH = {d["table"]: d["title"] for d in DICT}
REL = [  # (ฝั่ง 1, ฝั่ง N, ชื่อ, cardinality, ฝั่ง 1 total?, ฝั่ง N total?) ตรงกับ er-diagram.drawio, total = FK NOT NULL
    ("suppliers", "skus", "จัดหาสินค้า", "1:N", False, False),
    ("skus", "stock", "มียอดคงเหลือ", "1:1", False, True),
    ("orders", "order_items", "ประกอบด้วย", "1:N", False, True),
    ("skus", "order_items", "จับคู่กับ", "1:N", False, False),
    ("orders", "labels", "มีใบปะสินค้า", "1:N", False, True),
    ("orders", "costs", "อ้างอิงต้นทุน", "1:N", False, False),
    ("skus", "costs", "มีต้นทุน", "1:N", False, True),
    ("skus", "reorders", "ถูกสั่งเติม", "1:N", False, True),
    ("suppliers", "reorders", "รับคำสั่งซื้อ", "1:N", False, True),
    ("reorders", "orders", "ครอบคลุม", "1:N", False, False),
    ("admins", "sessions", "เข้าสู่ระบบ", "1:N", False, True),
    ("admins", "deletion_history", "ลบคำสั่งซื้อ", "1:N", False, True),
    ("admins", "cost_history", "แก้ไขต้นทุน", "1:N", False, True),
    ("skus", "cost_history", "มีประวัติต้นทุน", "1:N", False, True),
    ("costs", "cost_history", "บันทึกการเปลี่ยนแปลง", "1:N", False, False),
    ("orders", "tracking_notification_logs", "แจ้งเลขติดตาม", "1:N", False, True),
    ("admins", "tracking_notification_logs", "ส่งแจ้งซ้ำ", "1:N", False, False),
    ("admins", "stock_adjustment_history", "ปรับสต๊อก", "1:N", False, True),
    ("stock", "stock_adjustment_history", "มีประวัติปรับสต๊อก", "1:N", False, True),
    ("admins", "label_print_history", "พิมพ์ใบปะ", "1:N", False, True),
    ("labels", "label_print_history", "มีประวัติการพิมพ์", "1:N", False, True),
    ("stock", "rakuten_stock_sync_states", "ซิงก์สต๊อก Rakuten", "1:1", False, True),
]
DOUBLE = 'color="black:invis:black"'


import math
import unicodedata

# ตำแหน่ง entity (นิ้ว) วางเองให้เส้นตัดกันน้อย ใช้ทั้งรูปภาพรวมและรูปแยกส่วน
POS = {  # ตำแหน่งเดียวกับ er-diagram.drawio (หาร 500 พิกเซล)
    "admins": (0, 4.3), "suppliers": (2.2, -2.6), "skus": (2.2, 0), "stock": (5.2, 0), "orders": (-2.2, 0), "order_items": (0, 0),
    "costs": (0, 1.6), "reorders": (0, -1.6), "labels": (-6, 1.8), "sessions": (3, 5.6), "auto_error_logs": (6.5, 5.6),
    "deletion_history": (-2.2, 5.9), "cost_history": (2.2, 2.6), "tracking_notification_logs": (-3, 2.8),
    "rakuten_stock_sync_states": (7.5, -0.7), "stock_adjustment_history": (5.2, 2.6), "label_print_history": (-6, 4.3),
}


vis = lambda s: sum(1 for ch in s if unicodedata.category(ch) != "Mn")  # ไม่นับสระบน/ล่างและวรรณยุกต์
hit = lambda a, b, pad=0.1: abs(a[0] - b[0]) < (a[2] + b[2]) / 2 + pad and abs(a[1] - b[1]) < (a[3] + b[3]) / 2 + pad


def crosses(seg, box, pad=0.14):
    (x1, y1), (x2, y2) = seg
    return any(hit((x1 + (x2 - x1) * i / 80, y1 + (y2 - y1) * i / 80, 0, 0), box, pad) for i in range(81))


def ring(center, sizes, half_w, taken, lines):
    """วาง attribute รอบ entity ทีละวง ข้ามจุดที่ทับกล่อง/เส้น relationship หรือ attribute ที่วางไปแล้ว
    sizes: (กว้าง, สูง) ของแต่ละ attribute  taken: กล่องที่วางแล้วทั้งรูป  lines: เส้น relationship"""
    def fill(r, placed, left):
        rx, ry = r + half_w + 0.4, r * 0.85
        for s in range(360):
            if not left: break
            a = math.pi / 2 - 2 * math.pi * s / 360
            box = (center[0] + rx * math.cos(a), center[1] + ry * math.sin(a), *left[0])
            if any(hit(box, o) for o in taken + placed) or any(crosses(l, box) for l in lines): continue
            placed.append(box); left.pop(0)
    r = 1.0
    while r <= (3.0 if len(sizes) <= 14 else 6.5):  # วงเดียวถ้าพอ
        placed, left = [], list(sizes)
        fill(r, placed, left)
        if not left: return placed
        r += 0.2
    placed, left, r = [], list(sizes), 3.4
    while left:
        fill(r, placed, left)
        r += 1.5
    return placed


def er(home, mode, scale=1.0, layout=None):
    """home: entity ที่แสดง attribute ในรูปนี้ (entity อื่นที่เชื่อมกันแสดงเป็นกล่องเทา)
    mode: "none" ไม่แสดง attribute, "full" ทุก attribute, "query" PK/FK + attribute ที่ถูก UPDATE + เลข query
    """
    g = ['graph ER {', '  layout=neato; overlap=true; splines=line; outputorder=edgesfirst;',
         '  node [fontname="Helvetica", fontsize=14]; edge [fontname="Helvetica", fontsize=13];']
    by_table = defaultdict(list)
    upd = defaultdict(lambda: defaultdict(list))
    for q in QUERIES:
        for t in q["tables"]:
            if t in q["sets"]:
                for c in q["sets"][t]: upd[t][c].append(q["id"])
            else:
                by_table[t].append(q["id"])
    rels = [r for r in REL if r[0] in home or r[1] in home]
    shown = set(home) | {r[0] for r in rels} | {r[1] for r in rels}
    P = {t: (x * scale, y * scale) for t, (x, y) in (layout or POS).items()}
    pos = lambda xy: f'pos="{xy[0]:.2f},{xy[1]:.2f}!"'
    ent_w = lambda t: len(t) * 0.13 + 0.5
    taken = [(*P[t], ent_w(t), 0.55) for t in shown]
    lines = [(P[a], P[b]) for a, b, *_ in rels]
    for i, (a, b, name, card, ta, tb) in enumerate(rels):
        r = f"rel{i}"
        ca, cb = card.split(":")
        f0 = 0.5 if (a in home) == (b in home) else (0.64 if a in home else 0.36)
        w = max(1.5, vis(name) * 0.15 + 0.4)
        for f in (f0, f0 - 0.08, f0 + 0.08, f0 - 0.16, f0 + 0.16, f0 - 0.24, f0 + 0.24, f0):
            mid = (P[a][0] + (P[b][0] - P[a][0]) * f, P[a][1] + (P[b][1] - P[a][1]) * f)
            box = (*mid, w * 0.8, 0.7)
            if not any(hit(box, o) for o in taken) and not any(crosses(l, box, 0.05) for j, l in enumerate(lines) if j != i): break
        taken.append(box)
        g.append(f'  "{r}" [{pos(mid)}, shape=diamond, style=filled, fillcolor="#fff7d6", label="{name}", fontsize=13, fixedsize=true, width={w:.2f}, height=0.7];')
        g.append(f'  "{a}" -- "{r}" [label="{ca}"{", " + DOUBLE if ta else ""}];')
        g.append(f'  "{r}" -- "{b}" [label="{cb}"{", " + DOUBLE if tb else ""}];')
    for d in DICT:
        t = d["table"]
        if t not in shown: continue
        mine = t in home
        g.append(f'  "{t}" [{pos(P[t])}, shape=box, style="filled", fillcolor="{"#e9f2fe" if mine else "#f8f8f8"}", color="{"#1868db" if mine else "#8c8f97"}", penwidth=1.6, label="{t.upper()}"];')
        if not mine: continue
        cols = []
        for c in d["columns"]:
            key = c["key"]
            if mode == "none": continue
            if mode == "query" and not key and c["name"] not in upd[t]: continue
            cols.append(c)
        if mode == "query" and by_table[t]: cols.append({"name": "__q", "key": ""})
        nodes = []
        for c in cols:
            nid = f"{t}.{c['name']}"
            if c["name"] == "__q":
                ids = by_table[t]
                rows = [", ".join(ids[i:i + 3]) for i in range(0, len(ids), 3)]
                size = (max(map(len, rows)) * 0.085 + 0.35, len(rows) * 0.2 + 0.25)
                nodes.append((size, f'  "{nid}" [{{}}, shape=note, color="#c9372c", fontcolor="#c9372c", fontsize=12, fixedsize=true, width={size[0]:.2f}, height={size[1]:.2f}, style=filled, fillcolor=white, label=<{"<br/>".join(rows)}>];\n'
                                    f'  "{t}" -- "{nid}" [style=dashed, color="#c9372c"];'))
                continue
            key = c["key"]
            label = f"<<u>{c['name']}</u>>" if "PK" in key else (f"<<i>{c['name']}</i>>" if "FK" in key else f'"{c["name"]}"')
            extra, size = "", (len(c["name"]) * 0.095 + 0.4, 0.42)
            if mode == "query" and c["name"] in upd[t] and "PK" not in key:
                ids = upd[t][c["name"]]
                rows = [", ".join(ids[i:i + 3]) for i in range(0, len(ids), 3)]
                label = f'<{c["name"]}<br/><font point-size="3"> </font><br/><font color="#c9372c" point-size="11">{"<br/>".join(rows)}</font>>'
                extra = ', color="#c9372c"'
                size = (max(len(c["name"]) * 0.095, max(map(len, rows)) * 0.08) + 0.6, 0.56 + len(rows) * 0.2)
            nodes.append((size, f'  "{nid}" [{{}}, shape=ellipse, style=filled, fillcolor=white, label={label}, fontsize=12, fixedsize=true, width={size[0]:.2f}, height={size[1]:.2f}{extra}];\n'
                                f'  "{t}" -- "{nid}";'))
        spots = ring(P[t], [n[0] for n in nodes], ent_w(t) / 2, taken, lines)
        taken += spots
        for (size, text), box in zip(nodes, spots): g.append(text.format(pos(box)))
    g.append("}")
    return "\n".join(g) + "\n"


ALL = [d["table"] for d in DICT]
PART_POS = [
    {"orders": (0, 0), "order_items": (10, 0), "labels": (-9, -6), "costs": (6, 8), "reorders": (6, -8),
     "tracking_notification_logs": (-9, 6)},
    {"order_items": (0, 0), "labels": (-8, -5), "tracking_notification_logs": (-8, 5), "label_print_history": (-16, -5),
     "orders": (-8, 0), "skus": (8, 0), "admins": (-16, 5)},
    {"skus": (0, 0), "stock": (9, 0), "rakuten_stock_sync_states": (16, 4), "costs": (-1, 8), "reorders": (-1, -8),
     "suppliers": (8, -7), "orders": (-11, 0), "order_items": (-6, 0), "cost_history": (7, 9), "stock_adjustment_history": (16, -4)},
    {"admins": (0, 0), "sessions": (-8, 6), "deletion_history": (-8, -6), "cost_history": (8, 6), "stock_adjustment_history": (8, -6),
     "auto_error_logs": (0, -10), "tracking_notification_logs": (-13, 0), "label_print_history": (0, 9), "labels": (0, 13),
     "orders": (-17, 0), "skus": (15, 9), "costs": (15, 4), "stock": (15, -6)},
]
ER_PARTS = [
    ["orders"],
    ["order_items", "labels", "tracking_notification_logs", "label_print_history"],
    ["skus", "stock", "costs", "reorders", "suppliers", "rakuten_stock_sync_states"],
    ["admins", "sessions", "deletion_history", "cost_history", "stock_adjustment_history", "auto_error_logs"],
]
ER_SCALE = [1.0, 1.0, 1.0, 1.0]  # ย่อระยะระหว่าง entity ในรูปที่ attribute น้อย
write("er-0.dot", er(ALL, "none", 1.0))
for n, part in enumerate(ER_PARTS, 1):
    write(f"er-{n}.dot", er(part, "full", ER_SCALE[n - 1], PART_POS[n - 1]))
for n, part in enumerate(ER_PARTS, 1):
    write(f"er-query-{n}.dot", er(part, "query", ER_SCALE[n - 1], PART_POS[n - 1]))

# ------------------------------------------------------------------ Data Flow Diagram
EXT = 'shape=box, style=filled, fillcolor="#e9f2fe", color="#1868db", penwidth=1.6'
PROC = 'shape=box, style="rounded,filled", fillcolor="#fff7d6", penwidth=1.4'
STORE = 'shape=record, style=filled, fillcolor="#f8f8f8"'
write("dfd-context.dot", f"""digraph DFD0 {{
  rankdir=LR; nodesep=0.7; ranksep=1.6; node [fontname="Helvetica", fontsize=14]; edge [fontname="Helvetica", fontsize=12];
  Admin [{EXT}, label="Admin\\n(เจ้าของ)"]; RMS [{EXT}, label="Rakuten Ichiba\\n(RMS)"]; RSL [{EXT}, label="RSL"];
  Delivery [{EXT}, label="Delivery"]; Supplier [{EXT}, label="Supplier"];
  P0 [{PROC}, label="0\\nระบบจัดการหลังบ้าน\\nColorado"];
  Admin -> P0 [label="ข้อมูลเข้าสู่ระบบ, ยืนยัน Order,\\nกฎ SKU, ต้นทุน, ผลตัดสินใจสั่งซื้อ"];
  P0 -> Admin [label="รายการ Order, สต๊อก, ต้นทุนต่อหน่วย,\\nใบปะสินค้า, รายงาน"];
  RMS -> P0 [label="คำสั่งซื้อใหม่"]; P0 -> RMS [label="เลขติดตามพัสดุ,\\nจำนวนคงเหลือ"];
  RSL -> P0 [label="ข้อมูลสินค้าในคลัง RSL"]; P0 -> RSL [label="คำขอจับคู่ Order"];
  Delivery -> P0 [label="เลขติดตาม, สถานะพัสดุ"]; P0 -> Delivery [label="พัสดุพร้อมใบปะ"];
  P0 -> Supplier [label="คำสั่งซื้อเติมสต๊อก"]; Supplier -> P0 [label="ผลการสั่งซื้อ"];
}}
""")
write("dfd-level0.dot", f"""digraph DFD1 {{
  rankdir=LR; nodesep=0.45; ranksep=2.2; node [fontname="Helvetica", fontsize=13]; edge [fontname="Helvetica", fontsize=11];
  Admin [{EXT}, label="Admin"]; RMS [{EXT}, label="Rakuten Ichiba\\n(RMS)"]; RSL [{EXT}, label="RSL"];
  Delivery [{EXT}, label="Delivery"]; Supplier [{EXT}, label="Supplier"];
  P1 [{PROC}, label="1.0\\nเข้าสู่ระบบ\\n(1A)"];
  P2 [{PROC}, label="2.0\\nรับและตรวจสอบคำสั่งซื้อ\\n(4A, 2A, 2S, 7A)"];
  P3 [{PROC}, label="3.0\\nจัดการสินค้าและสต๊อก\\n(3A, 3S, 7S)"];
  P4 [{PROC}, label="4.0\\nคำนวณต้นทุนและสั่งซื้อเติม\\n(4S, 5A, 6A)"];
  P5 [{PROC}, label="5.0\\nจัดการใบปะและจัดส่ง\\n(1S, 6S, 9A, 8A, 5S)"];
  P6 [{PROC}, label="6.0\\nลบข้อมูลเก่า\\n(10A)"];
  D1 [{STORE}, label="D1 | admins, sessions"]; D2 [{STORE}, label="D2 | orders, order_items"]; D3 [{STORE}, label="D3 | skus"];
  D4 [{STORE}, label="D4 | stock, stock_adjustment_history,\\nrakuten_stock_sync_states"]; D5 [{STORE}, label="D5 | costs, cost_history"];
  D6 [{STORE}, label="D6 | suppliers, reorders"]; D7 [{STORE}, label="D7 | labels, label_print_history"];
  D8 [{STORE}, label="D8 | tracking_notification_logs"]; D9 [{STORE}, label="D9 | deletion_history"];
  D10 [{STORE}, label="D10 | auto_error_logs"];
  {{rank=min; Admin; RMS; RSL; Delivery; Supplier}} {{rank=same; P1; P2; P3; P4; P5; P6}} {{rank=max; D1; D2; D3; D4; D5; D6; D7; D8; D9; D10}}
  Admin -> P1 [label="อีเมล, รหัสผ่าน"]; P1 -> D1 [label="fail_attempts, last_login"]; D1 -> P1 [label="ข้อมูลผู้ใช้"];
  RMS -> P2 [label="คำสั่งซื้อใหม่"]; Admin -> P2 [label="ยืนยัน/ยกเลิก Order"]; P2 -> D2 [label="Order, สถานะ"];
  D3 -> P2 [label="กฎ SKU"];
  Admin -> P3 [label="ข้อมูลสินค้า, กฎ SKU"]; P3 -> D3 [label="สินค้า, กฎ SKU"]; D4 -> P3 [label="ยอดสต๊อก"];
  P3 -> D4 [label="ยอดหลังตัดสต๊อก"]; P3 -> RMS [label="จำนวนคงเหลือ"]; P3 -> D2 [label="สถานะ Order, แหล่งที่จัดส่ง"];
  RSL -> P3 [label="ยอดสต๊อก RSL"]; D2 -> P3 [label="ยอดที่ถูกจอง"];
  D5 -> P4 [label="องค์ประกอบต้นทุน"]; P4 -> D5 [label="ต้นทุนต่อหน่วย"]; Admin -> P4 [label="ผลตัดสินใจ"];
  P4 -> Admin [label="ต้นทุน, กำไรที่คาด"]; D6 -> P4 [label="ข้อมูล Supplier"]; P4 -> D6 [label="คำสั่งซื้อเติม"];
  P4 -> Supplier [label="คำสั่งซื้อ"]; P4 -> D2 [label="ผลตัดสินใจ, จำนวนที่สั่ง"];
  RSL -> P5 [label="ข้อมูล RSL"]; D7 -> P5 [label="ใบปะที่สร้างแล้ว"]; D2 -> P5 [label="Order, แหล่งที่จัดส่ง"]; Admin -> P5 [label="สั่งพิมพ์, ส่งมอบ"]; P5 -> D7 [label="ใบปะสินค้า"];
  P5 -> Admin [label="ใบปะสินค้า"]; P5 -> Delivery [label="พัสดุ"]; Delivery -> P5 [label="เลขติดตาม, สถานะ"];
  P5 -> D8 [label="ผลการแจ้งเลขติดตาม"]; P5 -> RMS [label="เลขติดตาม"]; P5 -> D2 [label="สถานะจัดส่ง"];
  Admin -> P6 [label="ประเภทข้อมูล, วันที่"]; D2 -> P6 [label="Order ที่ปิดแล้ว"]; P6 -> D9 [label="บันทึกการลบ"];
  P2 -> D10 [label="ข้อผิดพลาด"]; P3 -> D10 [label="ข้อผิดพลาด"]; P5 -> D10 [label="ข้อผิดพลาด"];
}}
""")
print("written:", sorted(os.listdir(SRC)))
