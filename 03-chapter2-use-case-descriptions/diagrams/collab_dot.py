"""แปลง mmd/*-collaboration.mmd เป็น Graphviz ให้หน้าตาเหมือน collaboration ใน sa-ref.pdf
กล่อง class 3 ช่อง (ชื่อตัวหนา / attribute ว่าง / method ชิดซ้าย), เส้นโค้ง, ป้ายเลขแบบ "1." และ "7.1."
ใช้: python3 collab_dot.py <in.mmd> <out.png>  (render.sh เรียกให้เอง ต้องมี graphviz: brew install graphviz)
"""
import html
import re
import subprocess
import sys

HEAD = """digraph G {
  rankdir=TB; splines=true; nodesep=0.4; ranksep=0.5; pad=0.2; bgcolor=white;
  node [shape=plaintext, margin=0, fontname="Tahoma", fontsize=14];
  edge [fontname="Tahoma", fontsize=13, arrowsize=0.8, penwidth=0.8, color="#333333"];
"""


def box(label):
    name, *methods = [html.escape(s, quote=False) for s in label.split("<br/>")]
    rows = "<br align='left'/>".join(methods) + "<br align='left'/>" if methods else " "
    return (f'<<table border="0" cellborder="1" cellspacing="0" cellpadding="4">'
            f'<tr><td width="100"><b>{name}</b></td></tr><tr><td> </td></tr><tr><td align="left">{rows}</td></tr></table>>')


def number(label):
    m = re.match(r"(\d+(?:\.\d+)?)([ab]?):\s*(.*)", label)
    if not m: return label
    n, sub, rest = m.groups()
    return f"{n}.{' ' if not sub else '%d. ' % ('ab'.index(sub) + 1)}{rest}"


def edge(a, b, label, order):
    # เส้นย้อนขึ้น (ไปหา object ที่ประกาศก่อน) วาดกลับด้าน ให้ลำดับชั้นเป็นไปตามลำดับที่ประกาศ
    up = order.get(b, 0) < order.get(a, 0)
    lines = [number(x).replace("\\", "\\\\").replace('"', '\\"') for x in label.split("<br/>")]
    label = lines[0] if len(lines) == 1 else "\\l".join(lines) + "\\l"
    return f'  {b} -> {a} [label="{label}", dir=back];' if up else f'  {a} -> {b} [label="{label}"];'


def convert(src):
    out, order, sink = [HEAD], {}, []
    for line in src.splitlines():
        m = re.match(r'^\s*(\w+)(?:\(\["([^"]*)"\]\)|\["([^"]*)"\])\s*$', line)
        if m:
            label = m.group(2) or m.group(3)
            order[m.group(1)] = len(order)
            if label.startswith("DBConnector"): sink.append(m.group(1))
            out.append(f"  {m.group(1)} [label={box(label)}];")
            continue
        m = re.match(r'^\s*(\w+)\s*(<?)-->\|"([^"]*)"\|\s*(\w+)\s*$', line)
        if m:
            a, both, label, b = m.groups()
            if both:  # A <-->|"4: ...<br/>5: return ..."| B = ส่งไปแล้วตอบกลับ
                go, back = label.split("<br/>", 1)
                out += [edge(a, b, go, order), edge(b, a, back, order)]
            else: out.append(edge(a, b, label, order))
    if sink: out.append("  { rank=max; %s }" % "; ".join(sink))
    return "\n".join(out) + "\n}\n"


if __name__ == "__main__":
    dot = convert(open(sys.argv[1], encoding="utf-8").read())
    subprocess.run(["dot", "-Tpng", "-Gdpi=200", "-o", sys.argv[2]], input=dot.encode(), check=True)
