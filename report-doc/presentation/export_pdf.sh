#!/bin/zsh
# ส่งออกสไลด์เป็น PDF ผ่าน PowerPoint:  ./presentation/export_pdf.sh
# PowerPoint บน Mac อ่านเขียนได้แค่ในโฟลเดอร์ของ Office จึงคัดลอกไปทำที่นั่นก่อน
cd "$(dirname "$0")"
node build_deck.js || exit 1
G="$HOME/Library/Group Containers/UBF8T346G9.Office"
NAME=Colorado-SA-presentation
# ปิดไฟล์ชื่อเดียวกันที่ค้างอยู่ใน PowerPoint ก่อน ไม่งั้นจะ export ฉบับเก่า
osascript -e "tell application \"Microsoft PowerPoint\" to if (exists presentation \"$NAME.pptx\") then close presentation \"$NAME.pptx\" saving no" 2>/dev/null
cp "output/$NAME.pptx" "$G/$NAME.pptx"; rm -f "$G/$NAME.pdf"
open -a "Microsoft PowerPoint" "$G/$NAME.pptx"; sleep 25
# อ้างถึงไฟล์ด้วยชื่อ ไม่ใช้ active presentation เพราะอาจมีไฟล์อื่นเปิดอยู่
osascript -e "tell application \"Microsoft PowerPoint\"
set p to presentation \"$NAME.pptx\"
save p in (POSIX file \"$G/$NAME.pdf\") as save as PDF
close p saving no
end tell"
sleep 2; cp "$G/$NAME.pdf" "output/$NAME.pdf" && rm -f "$G/$NAME.pptx" && echo "PDF -> output/$NAME.pdf"
