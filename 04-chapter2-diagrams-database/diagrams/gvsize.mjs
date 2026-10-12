import { readFileSync } from "node:fs";
import { Graphviz } from "@hpcc-js/wasm-graphviz";
const gv = await Graphviz.load();
for (const f of process.argv.slice(2)) {
  const src = readFileSync(f, "utf8"); const engine = (src.match(/layout=(\w+)/) ?? [null, "dot"])[1];
  const svg = gv.layout(src, "svg", engine); console.log(f, svg.match(/width="([\d.]+)pt" height="([\d.]+)pt"/).slice(1));
}
