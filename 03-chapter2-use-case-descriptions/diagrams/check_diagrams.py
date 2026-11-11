"""ตรวจ Sequence/Collaboration ทุก UC ให้ตรงเกณฑ์ข้อ 24-25 ของรูบริก
ใช้: python3 03-chapter2-use-case-descriptions/diagrams/check_diagrams.py

1. ข้อความจาก Admin ต้องไปที่ Screen (:*Screen, ชั้น View ของ MVC) เท่านั้น
1.0 ห้ามมี object ชื่อมีคำว่า View (รูบริกข้อ 24 ห้ามตั้งชื่อ object ข้าง actor ว่า view)
1.1 ห้ามมีลูกศรเข้า actor (ทั้ง sequence และ collaboration) ให้ Screen แสดงผลเองด้วย self message
1.2 MVC: Screen คุยกับ Controller (หรือตัวเอง) เท่านั้น ห้ามเรียก Model (UseCase/Queries) หรือ DB ตรง
    และนอกจาก Controller ห้ามใครส่งข้อความเข้า Screen
2. object ใน collaboration ต้องตรงกับ sequence
3. ทุกเส้นใน collaboration มีเลขกำกับ
4. query ทุกข้อของ UC (จาก report-doc/content/usecases.json) ต้องอยู่ในทั้งสองรูป
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MMD = os.path.join(HERE, "mmd")
UCS = os.path.join(os.path.dirname(os.path.dirname(HERE)), "report-doc", "content", "usecases.json")


def queries_by_uc():
    out = {}
    for uc in json.load(open(UCS, encoding="utf-8")):
        out[uc["id"]] = set(re.findall(r"\*\*(Q\w+\.\d+):\*\*", "\n".join(sum(uc["steps"], []))))
    return out


def mentioned(text):
    found = set()
    for uc, a, b in re.findall(r"Q(\d+[AS])\.(\d+)-(\d+)", text):
        found |= {f"Q{uc}.{i}" for i in range(int(a), int(b) + 1)}
    found |= set(re.findall(r"Q\d+[AS]\.\d+", text))
    return found


def seq_objects(text):
    objs, alias = {}, {}
    for m in re.finditer(r"^\s*(actor|participant)\s+(\w+)(?:\s+as\s+(.+))?$", text, re.M):
        name = (m.group(3) or m.group(2)).strip()
        alias[m.group(2)] = name
        objs[name.lstrip(":").split(" (")[0].strip()] = m.group(1)
    return objs, alias


def base(name):
    return name.lstrip(":").split(" (")[0].strip()


def collab_objects(text):
    names = set()
    for m in re.finditer(r'^\s*\w+(\(\[|\[)"([^"<]+)', text, re.M):
        names.add(m.group(2).strip().split(" (")[0])
    return names


errors = []
need = queries_by_uc()
for uc in sorted(need, key=lambda u: (u[-1], int(u[:-1]))):
    seq = open(os.path.join(MMD, f"{uc}-sequence.mmd"), encoding="utf-8").read()
    col = open(os.path.join(MMD, f"{uc}-collaboration.mmd"), encoding="utf-8").read()
    objs, alias = seq_objects(seq)
    actors = {k for k, v in alias.items() if objs.get(v.lstrip(":").split(" (")[0].strip()) == "actor"}
    role = lambda k: "actor" if k in actors else "view" if base(alias.get(k, k)).endswith("Screen") \
        else "controller" if base(alias.get(k, k)).endswith("Controller") else "model"
    for src, dst in re.findall(r"^\s*(\w+)\s*-{1,2}>>[+-]?\s*(\w+)\s*:", seq, re.M):
        a, b, name = role(src), role(dst), base(alias.get(dst, dst))
        if b == "actor": errors.append(f"{uc}: sequence มีลูกศรเข้า actor ({src} -> {dst})")
        elif a == "actor" and b != "view": errors.append(f"{uc}: Admin ส่งข้อความตรงไปที่ {name} (ต้องผ่าน Screen)")
        elif a == "view" and b not in ("view", "controller"): errors.append(f"{uc}: Screen เรียก {name} ตรง (ต้องผ่าน Controller)")
        elif b == "view" and a not in ("actor", "view", "controller"): errors.append(f"{uc}: {base(alias.get(src, src))} ส่งข้อความเข้า Screen ตรง")
    if actors and not any(role(k) == "view" for k in alias) or actors and not any(role(k) == "controller" for k in alias):
        errors.append(f"{uc}: มี actor แต่ไม่มี Screen/Controller")
    cnode = {m.group(1): m.group(2) for m in re.finditer(r'^\s*(\w+)\(\["([^"<]+)', col, re.M)}
    for dst in re.findall(r'-->\|"[^"]*"\|\s*(\w+)', col):
        if dst in cnode: errors.append(f"{uc}: collaboration มีเส้นเข้า actor {cnode[dst]}")
    s_names = {n for n in objs}
    for n in sorted(s_names | collab_objects(col)):
        if "view" in n.lower(): errors.append(f"{uc}: object {n} มีคำว่า View (รูบริกข้อ 24)")
    c_names = collab_objects(col)
    if s_names != c_names:
        errors.append(f"{uc}: object ไม่ตรงกัน sequence-only={sorted(s_names - c_names)} collab-only={sorted(c_names - s_names)}")
    for label in re.findall(r'-->\|"([^"]*)"\|', col):
        if not re.match(r"\d+(\.\d+)?[ab]?:", label): errors.append(f"{uc}: เส้นไม่มีเลขกำกับ '{label}'")
    for name, text in (("sequence", seq), ("collaboration", col)):
        miss = need[uc] - mentioned(text)
        if miss: errors.append(f"{uc}: {name} ไม่มี {sorted(miss, key=lambda q: int(q.split('.')[1]))}")

print("\n".join(errors) if errors else "ok: ทุก diagram ผ่าน")
sys.exit(1 if errors else 0)
