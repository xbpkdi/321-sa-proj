#!/usr/bin/env bash
# สร้าง PDF:  ./speaker_script/build.sh  ->  speaker_script/script-Colorado.pdf
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build
for _ in 1 2; do
  xelatex -interaction=nonstopmode -halt-on-error -output-directory=build script.tex > build/script.out 2>&1 \
    || { echo "สร้างไม่สำเร็จ ดู build/script.log"; grep -m5 '^!' build/script.log; exit 1; }
done
cp build/script.pdf "script-Colorado.pdf"
echo "PDF -> speaker_script/script-Colorado.pdf ($(grep -o "([0-9]* pages" build/script.log | tr -d "("))"; rm -rf build
