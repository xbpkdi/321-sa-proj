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

CLASS_GROUPS = [  # แบ่งรูปตามกลุ่มงาน (ตรงกับ process ใน DFD Level 0)
    ("เข้าสู่ระบบ", ["1A"]),
    ("รับและตรวจสอบคำสั่งซื้อ", ["4A", "2A", "2S", "7A"]),
    ("จัดการสินค้าและสต๊อก", ["3A", "3S", "7S"]),
    ("คำนวณต้นทุนและสั่งซื้อเติม", ["4S", "5A", "6A"]),
    ("จัดการใบปะและจัดส่ง", ["1S", "6S", "9A", "8A", "5S"]),
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

# entity class (ตรงกับตารางในฐานข้อมูล)
FK = []
out = INIT + "classDiagram\n    direction TB\n"
cname = lambda t: "".join(w.capitalize() for w in t.split("_"))
for d in DICT:
    cols = "\n".join(f"        -{c['name']}: {c['type']}" for c in d["columns"])
    out += f"    class {cname(d['table'])} {{\n{cols}\n    }}\n"
    for c in d["columns"]:
        for ref in re.findall(r"FK → (\w+)", c["key"]):
            FK.append((ref, d["table"], c["name"]))
seen = set()
for ref, t, col in FK:
    if (ref, t) in seen: continue
    seen.add((ref, t))
    one = t in ("stock", "product_cost", "delivery_partners", "carrier_tracking")
    out += f"    {cname(ref)} \"1\" -- \"{'1' if one else '0..*'}\" {cname(t)}\n"
for r, t in REPO_TABLE.items(): pass
write("class-7.mmd", out)

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
body = ""
for a, b, lab in T:
    x = "[*]" if a == "[*]" else st(a)
    y = "[*]" if b == "[*]" else st(b)
    body += f"        {x} --> {y} : {lab}\n"
decl = "".join(f'        state "Order.{n}" as {i}\n' for n, i in S.items())
write("state.mmd", "%%{init: {'themeVariables': {'fontSize': '15px'}}}%%\nstateDiagram-v2\n    direction TB\n"
      f'    state "Order (order_status)" as Order {{\n{decl}{body}    }}\n')

# ------------------------------------------------------------------ Component Diagram
ui = "<br/>".join(screens)
ct = "<br/>".join(ctrls)
rp = "<br/>".join(repos)
write("component.mmd", f"""%%{{init: {{'flowchart': {{'nodeSpacing': 40, 'rankSpacing': 70}}, 'themeVariables': {{'fontSize': '15px'}}}}}}%%
flowchart LR
    Admin(["Admin"])
    subgraph FE["«component» FrontEnd (Next.js 16, React 19)"]
        direction TB
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

# ตำแหน่ง entity (นิ้ว) วางเองให้เส้นตัดกันน้อย ใช้ทั้งรูปภาพรวมและรูปแยกส่วน
POS = {
    "suppliers": (0, 5), "purchase_orders": (2, 2.2), "products": (5, 5), "stock": (2.6, 8), "product_cost": (5, 8.6),
    "rsl_shipments": (7.4, 8), "sku_rules": (8.6, 5), "cost_calculation_log": (9.4, 2.4), "orders": (5, -1),
    "shipping_rules": (1, -1), "users": (10.4, -1), "label": (2.6, -4.4), "delivery_partners": (7.4, -4.4),
    "carrier_tracking": (7.4, -7.6), "deletion_log": (12.4, -4),
}


def ring(center, n, avoid, r0, half_w):
    """ตำแหน่ง attribute n ตัวรอบ entity เป็นวงรีซ้อนกัน เลี่ยงทิศที่มีเส้น relationship
    half_w: ครึ่งความกว้างกล่อง entity (นิ้ว) ใช้ขยายวงด้านข้างไม่ให้ทับกล่อง"""
    out, k, r = [], 0, r0
    perim_of = lambda r: math.pi * (3 * (r + half_w + 0.5 + r * 0.85) - math.sqrt((3 * (r + half_w + 0.5) + r * 0.85) * (r + half_w + 0.5 + 3 * r * 0.85)))
    while perim_of(r) / 1.8 < n + 2 * len(avoid) and r < (7.0 if n > 14 else 3.4):
        r += 0.2
    while len(out) < n:
        rx, ry = r + half_w + 0.5, r * 0.85
        perim = math.pi * (3 * (rx + ry) - math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
        cap = max(6, int(perim / 1.8))
        angles = [2 * math.pi * (s + 0.5 * k) / cap for s in range(cap)]
        near = lambda a, b: abs((a - b + math.pi) % (2 * math.pi) - math.pi) < max(math.pi / cap, 0.24)
        free = [a for a in angles if not any(near(a, v) for v in avoid)]
        left = n - len(out)
        step = max(1, len(free) // left) if left < len(free) else 1
        take = free[::step][:left]
        out += [(center[0] + rx * math.cos(a), center[1] + ry * math.sin(a)) for a in take]
        k += 1
        r += 1.0
    return out


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
        avoid = [math.atan2(P[o][1] - P[t][1], P[o][0] - P[t][0]) for a, b, *_ in rels for o in ((b,) if a == t else (a,) if b == t else ())]
        if mode == "query" and by_table[t]: cols.append({"name": "__q", "key": ""})
        spots = ring(P[t], len(cols), avoid, 1.1, len(t) * 0.055 + 0.15)
        for c, xy in zip(cols, spots):
            nid = f"{t}.{c['name']}"
            if c["name"] == "__q":
                ids = by_table[t]
                lines = "<br/>".join(", ".join(ids[i:i + 3]) for i in range(0, len(ids), 3))
                g.append(f'  "{nid}" [{pos(xy)}, shape=note, color="#c9372c", fontcolor="#c9372c", fontsize=12, label=<{lines}>];')
                g.append(f'  "{t}" -- "{nid}" [style=dashed, color="#c9372c"];')
                continue
            key = c["key"]
            label = f"<<u>{c['name']}</u>>" if "PK" in key else (f"<<i>{c['name']}</i>>" if "FK" in key else f'"{c["name"]}"')
            extra = ""
            if mode == "query" and c["name"] in upd[t] and "PK" not in key:
                ids = upd[t][c["name"]]
                wrap = "<br/>".join(", ".join(ids[i:i + 3]) for i in range(0, len(ids), 3))
                label = f'<{c["name"]}<br/><font color="#c9372c" point-size="11">{wrap}</font>>'
                extra = ', color="#c9372c"'
            g.append(f'  "{nid}" [{pos(xy)}, shape=ellipse, label={label}, fontsize=12, margin="0.04,0.02"{extra}];')
            g.append(f'  "{t}" -- "{nid}";')
    for i, (a, b, name, card, ta, tb) in enumerate(rels):
        r = f"rel{i}"
        ca, cb = card.split(":")
        f = 0.5 if (a in home) == (b in home) else (0.64 if a in home else 0.36)
        mid = (P[a][0] + (P[b][0] - P[a][0]) * f, P[a][1] + (P[b][1] - P[a][1]) * f)
        g.append(f'  "{r}" [{pos(mid)}, shape=diamond, style=filled, fillcolor="#fff7d6", label="{name}", fontsize=13, fixedsize=true, width={max(1.4, len(name) * 0.09):.2f}, height=0.6];')
        g.append(f'  "{a}" -- "{r}" [label="{ca}"{", " + DOUBLE if ta else ""}];')
        g.append(f'  "{r}" -- "{b}" [label="{cb}"{", " + DOUBLE if tb else ""}];')
    g.append("}")
    return "\n".join(g) + "\n"


ALL = [d["table"] for d in DICT]
PART_POS = [
    {**POS, "orders": (0, 0), "products": (0, 10), "sku_rules": (8.5, 8), "purchase_orders": (-8.5, 8), "shipping_rules": (-13, 0),
     "users": (13, 0), "label": (-7.5, -9), "delivery_partners": (7.5, -9)},
    {**POS, "orders": (0, 0), "shipping_rules": (-7, 0), "users": (8, 0), "label": (-4.5, -6), "delivery_partners": (3, -6),
     "carrier_tracking": (3, -11.5), "deletion_log": (11, -6), "cost_calculation_log": (8, 6)},
    {**POS, "products": (0, 0), "stock": (-7, 6.5), "product_cost": (0, 8.5), "rsl_shipments": (7, 6.5), "sku_rules": (9, 0),
     "suppliers": (-9, 0), "purchase_orders": (-6, -6.5), "cost_calculation_log": (6, -6.5), "orders": (0, -10), "users": (10, -10)},
]
ER_PARTS = [
    ["orders"],
    ["users", "deletion_log", "label", "shipping_rules", "delivery_partners", "carrier_tracking"],
    ["products", "sku_rules", "stock", "product_cost", "cost_calculation_log", "purchase_orders", "suppliers", "rsl_shipments"],
]
write("er-0.dot", er(ALL, "none", 1.0))
for n, part in enumerate(ER_PARTS, 1):
    write(f"er-{n}.dot", er(part, "full", 1.0, PART_POS[n - 1]))
for n, part in enumerate(ER_PARTS, 1):
    write(f"er-query-{n}.dot", er(part, "query", 1.0, PART_POS[n - 1]))

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
  rankdir=TB; nodesep=0.35; ranksep=0.9; node [fontname="Helvetica", fontsize=13]; edge [fontname="Helvetica", fontsize=11];
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
