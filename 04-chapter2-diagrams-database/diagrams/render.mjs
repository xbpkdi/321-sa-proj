// แปลง diagrams/src/*.dot และ *.mmd เป็น PNG ใน diagrams/png/
// ใช้: cd 04-chapter2-diagrams-database && npm run diagrams
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import { Graphviz } from "@hpcc-js/wasm-graphviz";
import puppeteer from "puppeteer-core";

const SRC = new URL("src/", import.meta.url).pathname;
const OUT = new URL("png/", import.meta.url).pathname;
const CSS = new URL("../../03-chapter2-use-case-descriptions/diagrams/note-fix.css", import.meta.url).pathname;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
mkdirSync(OUT, { recursive: true });

const only = process.argv.slice(2);
const files = readdirSync(SRC).filter((f) => !only.length || only.some((o) => f.startsWith(o)));

for (const f of files.filter((f) => f.endsWith(".mmd"))) {
  execFileSync("npx", ["-y", "@mermaid-js/mermaid-cli", "-q", "-i", SRC + f, "-o", OUT + f.replace(".mmd", ".png"),
    "-s", "2", "-b", "white", "-C", CSS, "-c", new URL("mermaid.json", import.meta.url).pathname], { stdio: "inherit" });
  console.log("png", f);
}

const dots = files.filter((f) => f.endsWith(".dot"));
if (dots.length) {
  const gv = await Graphviz.load();
  const browser = await puppeteer.launch({ executablePath: CHROME });
  const page = await browser.newPage();
  for (const f of dots) {
    const src = readFileSync(SRC + f, "utf8");
    const engine = (src.match(/layout=(\w+)/) ?? [null, "dot"])[1];
    const svg = gv.layout(src, "svg", engine);
    const [, w, h] = svg.match(/width="([\d.]+)pt" height="([\d.]+)pt"/);
    await page.setViewport({ width: Math.ceil(+w * 1.34), height: Math.ceil(+h * 1.34), deviceScaleFactor: 2 });
    await page.setContent(`<html><body style="margin:0;background:#fff;font-family:'TH Sarabun New',Helvetica,sans-serif">${svg}</body></html>`);
    await page.$eval("svg", (s) => { s.style.width = "100%"; s.style.height = "auto"; });
    await (await page.$("svg")).screenshot({ path: OUT + f.replace(".dot", ".png") });
    console.log("png", f);
  }
  await browser.close();
}
