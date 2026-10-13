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
EXTERNAL = {"Admin", "Scheduler", "Marketplace", "Supplier", "Delivery", "Printer"}


def write(name, text):
    with open(os.path.join(SRC, name), "w", encoding="utf-8") as f: f.write(text)


# ------------------------------------------------------------------ Class Diagram
methods = defaultdict(set)
uc_objs = defaultdict(set)
calls = defaultdict(set)  # class -> classes ที่เรียกใช้
for uc in UCS:
    seq = open(os.path.join(MMD, f"{uc}-sequence.mmd"), encoding="utf-8").read()
    col = open(os.path.join(MMD, f"{uc}-collaboration.mmd"), encoding="utf-8").read()
    alias = {}
    for m in re.finditer(r"^\s*(?:actor|participant)\s+(\w+)(?:\s+as\s+(.+))?$", seq, re.M):
        alias[m.group(1)] = (m.group(2) or m.group(1)).strip().lstrip(":").split(" (")[0].split(" /")[0]
        uc_objs[uc].add(alias[m.group(1)])
    for src, dst, msg in re.findall(r"^\s*(\w+)->>[+-]?(\w+):\s*(\w+)\(", seq, re.M):
        a, b = alias.get(src), alias.get(dst)
        if not a or not b or b in EXTERNAL: continue
        methods[b].add(msg)
        if a != b and a not in EXTERNAL: calls[a].add(b)
    for m in re.finditer(r'^\s*\w+\["([^"<]+)((?:<br/>[^"]*)?)"\]', col, re.M):
        name = m.group(1).strip().split(" (")[0]
        methods[name] |= set(re.findall(r"\+(\w+)\(", m.group(2)))

kind = lambda c: "screen" if c.endswith("Screen") else "controller" if c.endswith("Controller") else "repo" if c.endswith("Repository") else "db"
classes = sorted(methods, key=lambda c: (["screen", "controller", "repo", "db"].index(kind(c)), c))
REPO_TABLE = {"UserRepository": "users", "OrderRepository": "orders", "ProductRepository": "products", "SkuRuleRepository": "sku_rules",
              "StockRepository": "stock", "ProductCostRepository": "product_cost", "CostLogRepository": "cost_calculation_log",
              "PurchaseOrderRepository": "purchase_orders", "SupplierRepository": "suppliers", "ShippingRuleRepository": "shipping_rules",
              "LabelRepository": "label", "RslRepository": "rsl_shipments", "DeliveryPartnerRepository": "delivery_partners",
              "CarrierTrackingRepository": "carrier_tracking", "DeletionLogRepository": "deletion_log"}


def class_block(c):
    attrs = []
    k = kind(c)
    if k == "screen": attrs = ["-controller", "-messages: string[]"]
    elif k == "controller": attrs = [f"-{d[0].lower() + d[1:]}: {d}" for d in sorted(calls[c]) if kind(d) == "repo"] or ["-scheduler: Scheduler"]
    elif k == "repo": attrs = ["-db: DBConnector", f"-table: string = \"{REPO_TABLE.get(c, '')}\""]
    else: attrs = ["-pool: Pool"]
    body = "\n".join(f"        {a}" for a in attrs) + "\n" + "\n".join(f"        +{m}()" for m in sorted(methods[c]))
    return f"    class {c} {{\n{body}\n    }}\n"


INIT = "%%{init: {'class': {'hideEmptyMembersBox': true}, 'themeVariables': {'fontSize': '15px'}}}%%\n"
screens = [c for c in classes if kind(c) == "screen"]
ctrls = [c for c in classes if kind(c) == "controller"]
repos = [c for c in classes if kind(c) == "repo"]

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
    g_scr = [c for c in screens if c in objs]
    g_ctl = [c for c in ctrls if c in objs]
    g_rep = [c for c in repos if c in objs]
    out = INIT + "classDiagram\n    direction LR\n"
    if g_scr: out += "    class BaseScreen {\n        <<abstract>>\n        #showSuccess()\n        #showError()\n    }\n"
    out += "    class BaseController {\n        <<abstract>>\n        #currentUser: User\n        #validate()\n    }\n"
    out += "    class BaseRepository {\n        <<abstract>>\n        #db: DBConnector\n        #executeQuery(queryId, params)\n    }\n"
    for c in g_scr + g_ctl + g_rep: out += class_block(c)
    out += class_block("DBConnector")
    for c in g_scr: out += f"    BaseScreen <|-- {c}\n"
    for c in g_ctl: out += f"    BaseController <|-- {c}\n"
    for c in g_rep: out += f"    BaseRepository <|-- {c}\n"
    out += "    BaseRepository o-- DBConnector : db\n"
    for c in g_scr:
        for d in sorted(calls[c]):
            if d in g_ctl: out += f"    {c} \"1\" --> \"1\" {d} : uses\n"
    for c in g_ctl:
        for d in sorted(calls[c]):
            if d in g_rep: out += f"    {c} ..> {d}\n"
            elif d in g_ctl: out += f"    {c} ..> {d} : triggers\n"
    write(f"class-{n}.mmd", out)

# entity class (ตรงกับตารางในฐานข้อมูล) แบ่งรูปเหมือน ER Diagram ตารางนอกกลุ่มแสดงแค่ชื่อ
ENTITY_PARTS = [
    ["orders"],
    ["users", "deletion_log", "label", "shipping_rules", "delivery_partners", "carrier_tracking"],
    ["products", "sku_rules", "stock", "product_cost", "cost_calculation_log", "purchase_orders", "suppliers", "rsl_shipments"],
]
cname = lambda t: "".join(w.capitalize() for w in t.split("_"))
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
        out += f"    class {cname(d['table'])} {{\n{cols}\n    }}\n"
    for ref, t in FK:
        if ref not in part and t not in part: continue
        one = t in ("stock", "product_cost", "delivery_partners", "carrier_tracking")
        out += f"    {cname(ref)} \"1\" -- \"{'1' if one else '0..*'}\" {cname(t)}\n"
    write(f"class-{len(CLASS_GROUPS) + n}.mmd", out)

# ------------------------------------------------------------------ State Diagram ของ Order
S = OrderedDict()
def st(name):
    if name not in S: S[name] = f"s{len(S) + 1}"
    return S[name]
T = [
    ("[*]", "รอตรวจสอบคำสั่งซื้อ", "importOrders / 4A (Q4A.2)"),
    ("รอตรวจสอบคำสั่งซื้อ", "รอจับคู่กฎ SKU", "[ข้อมูลครบ] confirmOrder / 2A (Q2A.4)"),
    ("รอตรวจสอบคำสั่งซื้อ", "รอดำเนินการด้วยตนเอง", "[ข้อมูลไม่ครบ] confirmOrder / 2A"),
    ("รอจับคู่กฎ SKU", "รอตรวจสอบสต๊อก", "[พบกฎ SKU] matchSku / 2S (Q2S.2)"),
    ("รอจับคู่กฎ SKU", "รอดำเนินการด้วยตนเอง", "[ไม่พบกฎ SKU] matchSku / 2S"),
    ("รอดำเนินการด้วยตนเอง", "รอจับคู่กฎ SKU", "saveSkuRule / 3A"),
    ("รอตรวจสอบสต๊อก", "ยังไม่ได้จับคู่", "[สต๊อกพอ] checkStock / 3S (Q3S.2)"),
    ("รอตรวจสอบสต๊อก", "รอ Admin ตัดสินใจสั่งซื้อ", "[สต๊อกไม่พอ] checkStock / 3S, 4S (Q3S.2)"),
    ("รอ Admin ตัดสินใจสั่งซื้อ", "รอสั่งซื้อจาก Supplier", "[คุ้มค่า] approve / 5A (Q5A.4)"),
    ("รอ Admin ตัดสินใจสั่งซื้อ", "รอยกเลิก Order", "[ไม่คุ้มค่า] reject / 5A (Q5A.5)"),
    ("รอสั่งซื้อจาก Supplier", "สั่งซื้อแล้ว", "[ส่งคำสั่งซื้อสำเร็จ] purchase / 6A (Q6A.4)"),
    ("สั่งซื้อแล้ว", "ยังไม่ได้จับคู่", "[ได้รับสินค้า] restock / 3S (Q3S.2)"),
    ("รอยกเลิก Order", "ยกเลิกแล้ว", "confirmCancel / 7A (Q7A.1)"),
    ("ยังไม่ได้จับคู่", "รอจัดรูปแบบใบปะสินค้า", "[พบสินค้าใน RSL] matchRsl / 1S (Q1S.2)"),
    ("รอจัดรูปแบบใบปะสินค้า", "รอพิมพ์ใบปะสินค้า", "[พบ template] createLabel / 6S (Q6S.3)"),
    ("รอพิมพ์ใบปะสินค้า", "พิมพ์ใบปะสินค้าแล้ว", "[พิมพ์สำเร็จ] printLabel / 9A (Q9A.3)"),
    ("พิมพ์ใบปะสินค้าแล้ว", "อยู่ระหว่างจัดส่ง", "[ได้เลขติดตาม] handOver / 8A (Q8A.2)"),
    ("อยู่ระหว่างจัดส่ง", "แจ้งเลขติดตามแล้ว", "[Rakuten รับเลขติดตาม] sendTracking / 5S (Q5S.2)"),
    ("แจ้งเลขติดตามแล้ว", "จัดส่งสำเร็จ", "[ตัดสต๊อกสำเร็จ] deductStock / 7S (Q7S.5)"),
    ("ยังไม่ได้จับคู่", "ยกเลิกแล้ว", "[ยังไม่ส่งมอบ] cancelOrder / 7A (Q7A.1)"),
    ("จัดส่งสำเร็จ", "[*]", "[เก่ากว่า 12 เดือน] deleteOldData / 10A (Q10A.6)"),
    ("ยกเลิกแล้ว", "[*]", "[เก่ากว่า 12 เดือน] deleteOldData / 10A (Q10A.6)"),
]
for a, b, _ in T: [st(n) for n in (a, b) if n != "[*]"]


def state_mmd(name, title, rows):
    used = [n for n in S if any(n in (a, b) for a, b, _ in rows)]
    decl = "".join(f'        state "Order.{n}" as {S[n]}\n' for n in used)
    body = "".join(f"        {S.get(a, a)} --> {S.get(b, b)} : {lab}\n" for a, b, lab in rows)
    write(name, "%%{init: {'themeVariables': {'fontSize': '15px'}}}%%\nstateDiagram-v2\n    direction TB\n"
          f'    state "{title}" as Order {{\n{decl}{body}    }}\n')


# รูปรวมใช้ในสไลด์ ในเล่มแบ่ง 2 รูปที่สถานะ "ยังไม่ได้จับคู่" ให้ตัวหนังสืออ่านได้
SHIP = T.index(next(t for t in T if t[0] == "ยังไม่ได้จับคู่" and t[1] != "ยกเลิกแล้ว"))
after = [t for t in T[SHIP:] if t[0] != "ยกเลิกแล้ว"]
state_mmd("state.mmd", "Order (order_status)", T)
state_mmd("state-1.mmd", "Order (order_status) ก่อนจัดส่ง", [t for t in T if t not in after or t[0] == "ยังไม่ได้จับคู่" and t[1] == "ยกเลิกแล้ว"])
state_mmd("state-2.mmd", "Order (order_status) ช่วงจัดส่ง", [("[*]", "ยังไม่ได้จับคู่", "ต่อจากรูปก่อนหน้า")] + [t for t in after if t[1] != "ยกเลิกแล้ว"])

# ------------------------------------------------------------------ Component Diagram
pairs = lambda names: "<br/>".join(", ".join(names[i:i + 2]) for i in range(0, len(names), 2))
ui, ct, rp = pairs(screens), pairs(ctrls), pairs(repos)
write("component.mmd", f"""%%{{init: {{'flowchart': {{'nodeSpacing': 40, 'rankSpacing': 55, 'wrappingWidth': 700}}, 'themeVariables': {{'fontSize': '15px'}}}}}}%%
flowchart TB
    Admin(["Admin"])
    subgraph FE["«component» FrontEnd (Next.js 16, React 19)"]
        direction LR
        Pages["«component» Screens<br/>{ui}"]
        UILib["«library» shadcn/ui, Radix UI<br/>TanStack Table, Recharts<br/>Tailwind CSS, Sonner, Lucide"]
    end
    subgraph BE["«component» BackEnd (Next.js Server, TypeScript)"]
        direction TB
        Ctrl["«component» Controllers<br/>{ct}"]
        Repo["«component» Repositories<br/>{rp}"]
        Conn["«component» DBConnector<br/>node-postgres (pg)"]
        Sched["«component» Scheduler"]
    end
    DB[("«database» PostgreSQL<br/>15 tables")]
    RMS["«external API» Rakuten RMS API"]
    RSL["«external API» RSL API"]
    Carrier["«external API» Carrier Tracking API"]
    Printer["«device» Label Printer"]
    Mail["«external» Email (Supplier PO)"]

    Admin -->|"HTTPS"| Pages
    Pages -. uses .-> UILib
    Pages -->|"IController"| Ctrl
    Sched -->|"IController"| Ctrl
    Ctrl -->|"IRepository"| Repo
    Repo -->|"executeQuery()"| Conn
    Conn -->|"SQL"| DB
    Ctrl -->|"orders, tracking, stock"| RMS
    Ctrl -->|"match, stock"| RSL
    Ctrl -->|"tracking status"| Carrier
    Ctrl -->|"print"| Printer
    Ctrl -->|"purchase order"| Mail
""")

# ------------------------------------------------------------------ ER Diagram (Chen) และ ER พร้อม Query
TH = {d["table"]: d["title"] for d in DICT}
REL = [  # (ฝั่ง 1, ฝั่ง N, ชื่อ, cardinality, ฝั่ง 1 total?, ฝั่ง N total?)
    ("suppliers", "products", "จัดหา", "1:N", False, False),
    ("products", "sku_rules", "มีกฎ SKU", "1:N", False, True),
    ("products", "stock", "มีสต๊อก", "1:1", True, True),
    ("products", "product_cost", "มีต้นทุน", "1:1", False, True),
    ("products", "cost_calculation_log", "ถูกคำนวณต้นทุน", "1:N", False, True),
    ("users", "cost_calculation_log", "คำนวณต้นทุน", "1:N", False, True),
    ("products", "purchase_orders", "ถูกสั่งซื้อเติม", "1:N", False, True),
    ("suppliers", "purchase_orders", "รับคำสั่งซื้อ", "1:N", False, True),
    ("products", "orders", "ถูกสั่ง", "1:N", False, False),
    ("sku_rules", "orders", "จับคู่", "1:N", False, False),
    ("purchase_orders", "orders", "เติมสต๊อกให้", "1:N", False, False),
    ("shipping_rules", "orders", "กำหนดวิธีส่ง", "1:N", False, True),
    ("users", "orders", "ตรวจสอบ/ตัดสินใจ/ยกเลิก", "1:N", False, False),
    ("orders", "label", "มีใบปะ", "1:N", False, True),
    ("orders", "delivery_partners", "ส่งมอบ", "1:1", False, True),
    ("delivery_partners", "carrier_tracking", "ติดตามสถานะ", "1:1", False, True),
    ("products", "rsl_shipments", "เก็บใน RSL", "1:N", False, True),
    ("users", "deletion_log", "ลบข้อมูล", "1:N", False, True),
]
DOUBLE = 'color="black:invis:black"'


import math
import unicodedata

# ตำแหน่ง entity (นิ้ว) วางเองให้เส้นตัดกันน้อย ใช้ทั้งรูปภาพรวมและรูปแยกส่วน
POS = {
    "suppliers": (0, 5), "purchase_orders": (2, 2.2), "products": (5, 5), "stock": (2.6, 8), "product_cost": (5, 8.6),
    "rsl_shipments": (7.4, 8), "sku_rules": (8.6, 5), "cost_calculation_log": (9.4, 2.4), "orders": (5, -1),
    "shipping_rules": (1, -1), "users": (10.4, -1), "label": (2.6, -4.4), "delivery_partners": (7.4, -4.4),
    "carrier_tracking": (7.4, -7.6), "deletion_log": (12.4, -4),
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
        for i, t in enumerate(q["tables"]):
            if q["kind"] == "UPDATE" and i == 0:
                for c in q["set"]: upd[t][c].append(q["id"])
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
    {**POS, "orders": (0, 0), "products": (0, 7.6), "sku_rules": (9, 6.6), "purchase_orders": (-9, 6.6), "shipping_rules": (-12.5, 0),
     "users": (12.5, 0), "label": (-8, -6.8), "delivery_partners": (8, -6.8)},
    {**POS, "orders": (0, 0), "shipping_rules": (-7, 0), "users": (9.5, 0), "label": (-4.5, -6), "delivery_partners": (3, -6),
     "carrier_tracking": (3, -11.5), "deletion_log": (12.5, -6), "cost_calculation_log": (9.5, 6)},
    {**POS, "products": (0, 0), "stock": (-7, 6.5), "product_cost": (0, 8.5), "rsl_shipments": (7, 6.5), "sku_rules": (9, 0),
     "suppliers": (-9, 0), "purchase_orders": (-6, -6.5), "cost_calculation_log": (6, -6.5), "orders": (0, -10), "users": (10, -10)},
]
ER_PARTS = [
    ["orders"],
    ["users", "deletion_log", "label", "shipping_rules", "delivery_partners", "carrier_tracking"],
    ["products", "sku_rules", "stock", "product_cost", "cost_calculation_log", "purchase_orders", "suppliers", "rsl_shipments"],
]
ER_SCALE = [1.0, 0.75, 0.8]  # ย่อระยะระหว่าง entity ในรูปที่ attribute น้อย
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
  D1 [{STORE}, label="D1 | users"]; D2 [{STORE}, label="D2 | orders"]; D3 [{STORE}, label="D3 | products, sku_rules"];
  D4 [{STORE}, label="D4 | stock, rsl_shipments"]; D5 [{STORE}, label="D5 | product_cost, cost_calculation_log"];
  D6 [{STORE}, label="D6 | suppliers, purchase_orders"]; D7 [{STORE}, label="D7 | shipping_rules, label"];
  D8 [{STORE}, label="D8 | delivery_partners, carrier_tracking"]; D9 [{STORE}, label="D9 | deletion_log"];
  {{rank=min; Admin; RMS; RSL; Delivery; Supplier}} {{rank=same; P1; P2; P3; P4; P5; P6}} {{rank=max; D1; D2; D3; D4; D5; D6; D7; D8; D9}}
  Admin -> P1 [label="อีเมล, รหัสผ่าน"]; P1 -> D1 [label="fail_attempts, last_login"]; D1 -> P1 [label="ข้อมูลผู้ใช้"];
  RMS -> P2 [label="คำสั่งซื้อใหม่"]; Admin -> P2 [label="ยืนยัน/ยกเลิก Order"]; P2 -> D2 [label="Order, สถานะ"];
  D3 -> P2 [label="กฎ SKU"];
  Admin -> P3 [label="ข้อมูลสินค้า, กฎ SKU"]; P3 -> D3 [label="สินค้า, กฎ SKU"]; D4 -> P3 [label="ยอดสต๊อก"];
  P3 -> D4 [label="ยอดหลังตัดสต๊อก"]; P3 -> RMS [label="จำนวนคงเหลือ"]; P3 -> D2 [label="สถานะ Order"];
  D5 -> P4 [label="องค์ประกอบต้นทุน"]; P4 -> D5 [label="ต้นทุนต่อหน่วย"]; Admin -> P4 [label="ผลตัดสินใจ"];
  P4 -> Admin [label="ต้นทุน, กำไรที่คาด"]; D6 -> P4 [label="ข้อมูล Supplier"]; P4 -> D6 [label="คำสั่งซื้อเติม"];
  P4 -> Supplier [label="คำสั่งซื้อ"]; P4 -> D2 [label="ผลตัดสินใจ, po_id"];
  RSL -> P5 [label="ข้อมูล RSL"]; D7 -> P5 [label="template"]; P5 -> D7 [label="ใบปะสินค้า"];
  P5 -> Admin [label="ใบปะสินค้า"]; P5 -> Delivery [label="พัสดุ"]; Delivery -> P5 [label="เลขติดตาม, สถานะ"];
  P5 -> D8 [label="ข้อมูลส่งมอบ"]; P5 -> RMS [label="เลขติดตาม"]; P5 -> D2 [label="สถานะจัดส่ง"];
  Admin -> P6 [label="ประเภทข้อมูล, วันที่"]; D2 -> P6 [label="Order ที่ปิดแล้ว"]; P6 -> D9 [label="บันทึกการลบ"];
}}
""")
print("written:", sorted(os.listdir(SRC)))
