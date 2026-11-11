"""ตัด sequence diagram ที่ยาวเป็นหลายส่วน ให้ใส่เล่มแล้วตัวอักษรยังอ่านได้โดยไม่ต้องซูม
ตัดตรงช่องว่างระหว่างข้อความ (แถวที่มีแค่เส้น lifeline) และใส่หัว participant ซ้ำทุกส่วน
ใช้: python3 split_png.py png/<UC>-sequence.png [scale]  ได้ png/<UC>-sequence-1.png, -2.png, ... (ถ้าต้องตัด)

ความสูงต่อส่วนคิดจากหน้ากระดาษในเล่ม ให้ตัวอักษร 20px ออกมาไม่ต่ำกว่าราว 6pt
  แนวตั้ง 6.27 x 7.6 นิ้ว ใช้เมื่อรูปกว้างไม่เกิน 1500px (หน่วย css) สูงได้ 1800px
  แนวนอน 9.0 x 5.2 นิ้ว สูงได้ 1250px
"""
import glob
import math
import os
import sys

import numpy as np
from PIL import Image


def safe_rows(dark):
    # แถวที่เหมือนแถวถัดไปเกือบทั้งหมด = มีแค่เส้นแนวตั้งผ่าน ไม่มีข้อความหรือลูกศร
    change = (dark[1:] != dark[:-1]).sum(axis=1)
    return np.append(change <= 40, False)


def header_bottom(dark, s):
    rows = dark.sum(axis=1)
    edges = [y for y in range(len(rows)) if rows[y] > dark.shape[1] * 0.6]
    top = edges[0]
    bottom = next(y for y in edges if y > top + 20 * s and rows[y - 1] <= dark.shape[1] * 0.6)
    return bottom + 6 * s


def split(path, s=2):
    for old in glob.glob(path.replace(".png", "-[0-9].png")): os.remove(old)
    im = Image.open(path).convert("RGB")
    w, h = im.size
    budget = (1800 if w / s <= 1500 else 1250) * s
    if h <= budget * 1.08: return []
    dark = np.asarray(im.convert("L")) < 200
    head = header_bottom(dark, s)
    ok = safe_rows(dark)
    cuts, run = [], 0
    for y in range(head, h):
        run = run + 1 if ok[y] else 0
        if run >= 10 * s: cuts.append(y - run // 2)
    n = math.ceil((h - head) / (budget - head))
    step = (h - head) / n
    chosen, last = [], 0
    for k in range(1, n):
        ideal = head + step * k
        limit = (last or 0) + budget - (head if last else 0)
        cand = [c for c in cuts if last + 200 * s < c <= limit] or [c for c in cuts if c > last + 200 * s]
        if not cand: break
        last = min(cand, key=lambda c: abs(c - ideal))
        chosen.append(last)
    bounds = [0] + chosen + [h]
    out = []
    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        part = im.crop((0, a, w, b))
        if i:
            top = im.crop((0, 0, w, head))
            canvas = Image.new("RGB", (w, head + (b - a) + 10 * s), "white")
            canvas.paste(top, (0, 0)); canvas.paste(part, (0, head + 10 * s))
            part = canvas
        name = path.replace(".png", f"-{i + 1}.png")
        part.save(name, optimize=True)
        out.append(name)
    return out


if __name__ == "__main__":
    for p in split(sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else 2): print("  part", p)
