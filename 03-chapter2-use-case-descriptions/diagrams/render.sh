#!/bin/sh
# แปลง mmd/*.mmd เป็น png/ ใช้: ./render.sh [ชื่อไฟล์ขึ้นต้น เช่น 5A]
cd "$(dirname "$0")"
for f in mmd/${1:-}*.mmd; do
  echo "$f"
done | xargs -P 4 -I{} sh -c 'npx -y @mermaid-js/mermaid-cli -q -i "{}" -o "png/$(basename "{}" .mmd).png" -s 2 -b white -C note-fix.css -c mermaid.json && echo "png {}"'
