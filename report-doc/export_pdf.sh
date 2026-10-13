#!/bin/zsh
# สร้างรายงาน .docx (ฉบับ Word และฉบับ Google Docs) อัปเดตสารบัญ แล้ว export PDF ผ่าน Word:  ./report-doc/export_pdf.sh
cd "$(dirname "$0")"
NAME=รายงาน-SA-Colorado
DOCX="$PWD/output/$NAME.docx"
GDOCS="$PWD/output/สำหรับ-Google-Docs/$NAME.docx"
G="$HOME/Library/Group Containers/UBF8T346G9.Office"
python3 build_report.py || exit 1          # ฉบับ Word (มีจุดตัดคำไทยที่มองไม่เห็น)
PRINT=0 python3 build_report.py || exit 1  # ฉบับนำเข้า Google Docs
for f in "$DOCX" "$GDOCS"; do
  cp "$f" "$G/report.docx"
  osascript export_pdf.applescript "$G/report.docx" update || exit 1   # อัปเดตสารบัญ (Word เขียน style ทับ)
  python3 fix_toc_styles.py "$G/report.docx"                           # แก้ style สารบัญกลับ
  cp "$G/report.docx" "$f"
done
cp "$DOCX" "$G/report.docx"; rm -f "$G/report.pdf"
osascript export_pdf.applescript "$G/report.docx" "$G/report.pdf" || exit 1
cp "$G/report.pdf" "output/$NAME.pdf" && rm -f "$G/report.docx" && echo "PDF -> output/$NAME.pdf"
