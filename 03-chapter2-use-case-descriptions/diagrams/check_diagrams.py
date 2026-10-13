"""ตรวจ Sequence/Collaboration ทุก UC ให้ตรงเกณฑ์ข้อ 24-25 ของรูบริก
ใช้: python3 03-chapter2-use-case-descriptions/diagrams/check_diagrams.py

1. ข้อความจาก Admin ต้องไปที่หน้าจอ (:*Screen) หรือคน/ระบบภายนอก ห้ามตรงไปที่ controller
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
    for src, dst in re.findall(r"^\s*(\w+)-{1,2}>>[+-]?(\w+):", seq, re.M):
        if alias.get(src) == "Admin" and alias.get(dst, "").startswith(":") and not alias[dst].endswith("Screen"):
            errors.append(f"{uc}: Admin ส่งข้อความตรงไปที่ {alias[dst]} (ต้องผ่านหน้าจอ)")
    s_names = {n for n in objs}
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
