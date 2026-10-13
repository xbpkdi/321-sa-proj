#!/usr/bin/env bash
# สร้าง PDF:  ./qna_prep/build.sh  ->  qna_prep/qna-Colorado.pdf
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p build
for _ in 1 2; do
  xelatex -interaction=nonstopmode -halt-on-error -output-directory=build qna.tex > build/qna.out 2>&1 \
    || { echo "สร้างไม่สำเร็จ ดู build/qna.log"; grep -m5 '^!' build/qna.log; exit 1; }
done
cp build/qna.pdf "qna-Colorado.pdf"
echo "PDF -> qna_prep/qna-Colorado.pdf ($(grep -o "([0-9]* pages" build/qna.log | tr -d "("))"; rm -rf build
