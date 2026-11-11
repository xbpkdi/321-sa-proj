#!/bin/sh
# แปลง mmd/*.mmd เป็น png/ (และ svg/ ของ sequence) ใช้: ./render.sh [ชื่อไฟล์ขึ้นต้น เช่น 5A]
# sequence ใช้ mermaid แล้ว split_png.py ตัดรูปที่ยาวเป็น <UC>-sequence-1.png, -2.png, ...
# collaboration ใช้ graphviz ผ่าน collab_dot.py (brew install graphviz)
cd "$(dirname "$0")"
if [ -n "$SEQ" ]; then
  b=$(basename "$SEQ" .mmd)
  npx -y @mermaid-js/mermaid-cli -q -i "$SEQ" -o "png/$b.png" -s 2 -b white -C note-fix.css -c mermaid.json &&
    npx -y @mermaid-js/mermaid-cli -q -i "$SEQ" -o "svg/$b.svg" -b white -C note-fix.css -c mermaid.json &&
    python3 split_png.py "png/$b.png" 2 && echo "png $SEQ"
  exit
fi
mkdir -p svg
for f in mmd/${1:-}*-collaboration.mmd; do
  python3 collab_dot.py "$f" "png/$(basename "$f" .mmd).png" && echo "png $f"
done
ls mmd/${1:-}*-sequence.mmd | xargs -P 4 -n 1 -I{} env SEQ={} ./render.sh
