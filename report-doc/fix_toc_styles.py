"""หลัง Word อัปเดตสารบัญ มันจะเขียน style toc 1/toc 2 ทับเป็น Angsana 20pt + เว้นบรรทัด -> แก้กลับเป็น TH Sarabun New 16"""
import sys, zipfile, re, shutil, os
path = sys.argv[1]; tmp = path + ".tmp"
FIX = ('<w:pPr><w:spacing w:before="0" w:after="0" w:line="221" w:lineRule="auto"/>{ind}</w:pPr>'
       '<w:rPr><w:rFonts w:ascii="TH Sarabun New" w:hAnsi="TH Sarabun New" w:cs="TH Sarabun New" w:eastAsia="TH Sarabun New"/>'
       '<w:sz w:val="32"/><w:szCs w:val="32"/></w:rPr>')
def fix(m):
    sid = m.group(1); ind = '<w:ind w:left="432"/>' if sid == "TOC2" else ('<w:ind w:left="864"/>' if sid == "TOC3" else "")
    body = re.sub(r"<w:pPr>.*?</w:pPr>|<w:rPr>.*?</w:rPr>", "", m.group(0), flags=re.S)
    return body.replace("</w:style>", FIX.format(ind=ind) + "</w:style>")
with zipfile.ZipFile(path) as zi, zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zo:
    for it in zi.infolist():
        data = zi.read(it.filename)
        if it.filename == "word/styles.xml":
            data = re.sub(r'<w:style [^>]*w:styleId="(TOC1|TOC2|TOC3|TableofFigures)".*?</w:style>', fix, data.decode(), flags=re.S).encode()
        zo.writestr(it, data)
shutil.move(tmp, path); print("fixed TOC styles")
