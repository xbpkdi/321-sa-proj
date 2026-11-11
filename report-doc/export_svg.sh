#!/bin/sh
# สร้าง SVG ของทุก diagram (ภาพคมเมื่อซูม/ใช้ในสไลด์) แล้วคัดลอก png + svg ไป output/รูป-diagram/ ตั้งชื่อตามหัวข้อในเล่ม
# ใช้หลัง npm run diagrams (04) และ ./render.sh (03):  ./report-doc/export_svg.sh
# BP/UC ใช้ draw.io CLI (brew install --cask drawio), collaboration ใช้ graphviz -Tsvg
cd "$(dirname "$0")/.." || exit 1
ROOT=$(pwd)
OUT="$ROOT/report-doc/output/รูป-diagram"
BP="$ROOT/02-chapter2-business-process"
UC="$ROOT/03-chapter2-use-case-descriptions/diagrams"
DB="$ROOT/04-chapter2-diagrams-database/diagrams/png"
mkdir -p "$OUT" "$UC/svg"
rm -f "$OUT"/*.png "$OUT"/*.svg

bp() {  # bp <ไฟล์ drawio> <ชื่อรูปใน img/final ไม่มีนามสกุล>
  drawio -x -f svg --theme light -o "$BP/img/final/$2.svg" "$BP/src/$1" >/dev/null 2>&1 || echo "drawio failed: $1"
  cp "$BP/img/final/$2.png" "$BP/img/final/$2.svg" "$OUT/" 2>/dev/null
}
bp "SA Project - BizFlow-As-Is (fixed).drawio.xml" 2.1-business-process-as-is
bp "SA Project - BizFlow-As-Is-PainPoint (fixed).drawio.xml" 2.3-business-process-pain-points
bp "SA Project - BizFlow-To-Be (fixed).drawio.xml" 2.4-business-process-to-be
bp "SA Project - BizFlow-RelUseCase (fixed).drawio.xml" 2.6-business-process-rel-use-case
bp "SA Project - UseCase-As-Is (fixed).drawio.xml" 2.8-use-case-diagram-as-is
bp "SA Project - UseCase-To-Be usecase (fixed2).drawio.xml" 2.11-use-case-diagram-to-be

for f in "$UC"/mmd/*-collaboration.mmd; do
  b=$(basename "$f" .mmd)
  python3 -c "import sys; sys.path.insert(0, '$UC'); from collab_dot import convert; print(convert(open(sys.argv[1], encoding='utf-8').read()))" "$f" |
    dot -Tsvg -o "$UC/svg/$b.svg"
done
for f in "$UC"/png/*-sequence*.png "$UC"/png/*-collaboration.png; do cp "$f" "$OUT/2.13-$(basename "$f")"; done
for f in "$UC"/svg/*.svg; do cp "$f" "$OUT/2.13-$(basename "$f")"; done

db() {  # db <หัวข้อ> <prefix ใน 04/diagrams/png>
  for f in "$DB/$2"*.png "$DB/$2"*.svg; do [ -e "$f" ] && cp "$f" "$OUT/$1-$(basename "$f")"; done
}
db 2.14 er-
db 2.15 er-query-
db 2.18 class-
db 2.19 state
rm -f "$OUT"/2.14-er-query-*
ls "$OUT" | sed 's/\.[a-z]*$//' | sort -u | wc -l | xargs echo "diagrams:"
ls "$OUT"/*.svg | wc -l | xargs echo "svg:"
