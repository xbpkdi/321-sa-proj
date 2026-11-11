"""สร้าง mmd/<UC>-collaboration.mmd จาก mmd/<UC>-sequence.mmd ให้ข้อความครบทุกข้อและเลขตรงกับลำดับใน sequence
ข้อความแรกของแต่ละทางเลือก (alt/else/opt/loop) มีเงื่อนไขกำกับ เช่น "6: [invalid email format] showError(...)"
ข้อความระหว่าง object คู่เดียวกันในทิศเดียวกันรวมไว้บนเส้นเดียว
ใช้: python3 gen_collab.py [UC ...]  (ไม่ใส่ = ทุก UC)
"""
import glob
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MSG = re.compile(r"^\s*(\w+)\s*-{1,2}>>[+-]?\s*(\w+)\s*:\s*(.+?)\s*$")
BLOCK = re.compile(r"^\s*(alt|else|opt|loop|critical|break|par|and)\b\s*(.*)$")


def parse(text):
    objs, msgs, guard = {}, [], None
    for line in text.splitlines():
        m = re.match(r"^\s*(actor|participant)\s+(\w+)(?:\s+as\s+(.+))?\s*$", line)
        if m:
            objs[m.group(2)] = (m.group(1), (m.group(3) or m.group(2)).strip().lstrip(":").strip())
            continue
        m = re.match(r"^\s*Note\b.*?:\s*(Q\w+\.\d+)", line)
        if m and msgs:  # สูตรคำนวณใน Note ผูกเลข query กับข้อความก่อนหน้า
            src, dst, text_ = msgs[-1]
            msgs[-1] = (src, dst, f"{text_} [{m.group(1)}]")
            continue
        m = BLOCK.match(line)
        if m:
            kind, cond = m.groups()
            guard = f"*[{cond}]" if kind == "loop" else f"[{cond}]" if cond else None
            continue
        m = MSG.match(line)
        if m:
            src, dst, text_ = m.groups()
            msgs.append((src, dst, f"{guard} {text_}" if guard else text_))
            guard = None
    return objs, msgs


def method(text):
    name = re.sub(r"^\*?\[[^\]]*\]\s*", "", text).split("(")[0].strip()
    return None if name.startswith("return") or " " in name else "+" + name + "()"


def convert(seq):
    objs, msgs = parse(seq)
    methods = {k: [] for k in objs}
    edges = {}
    for i, (src, dst, text) in enumerate(msgs, 1):
        edges.setdefault((src, dst), []).append(f"{i}: {text}".replace('"', "'"))
        mt = method(text)
        if mt and mt not in methods[dst] and objs[dst][0] != "actor": methods[dst].append(mt)
    out = ["graph TB"]
    linked = {x for pair in edges for x in pair}
    for k, (kind, name) in objs.items():
        if k not in linked: continue
        body = "<br/>".join([name] + methods[k])
        out.append(f'    {k}(["{body}"])' if kind == "actor" else f'    {k}["{body}"]')
    out.append("")
    for (src, dst), labels in edges.items():
        out.append(f'    {src} -->|"{"<br/>".join(labels)}"| {dst}')
    return "\n".join(out) + "\n"


if __name__ == "__main__":
    ucs = sys.argv[1:] or [os.path.basename(f).split("-")[0] for f in glob.glob(os.path.join(HERE, "mmd", "*-sequence.mmd"))]
    for uc in ucs:
        seq = open(os.path.join(HERE, "mmd", f"{uc}-sequence.mmd"), encoding="utf-8").read()
        open(os.path.join(HERE, "mmd", f"{uc}-collaboration.mmd"), "w", encoding="utf-8").write(convert(seq))
        print(f"mmd/{uc}-collaboration.mmd")
