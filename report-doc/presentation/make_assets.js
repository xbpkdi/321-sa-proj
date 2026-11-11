// สร้างไอคอนของแถบนำทาง -> presentation/assets/
// ต้องมี react react-dom react-icons sharp:  NODE_PATH=<node_modules ที่มีแพ็กเกจเหล่านี้> node make_assets.js
const fs = require("fs");
const path = require("path");
const React = require("react");
const RDS = require("react-dom/server");
const fa = require("react-icons/fa");
const sharp = require("sharp");

const OUT = path.join(__dirname, "assets");
fs.mkdirSync(OUT, { recursive: true });

const ICONS = { intro: fa.FaStore, process: fa.FaProjectDiagram, usecase: fa.FaUserCog, design: fa.FaDraftingCompass, build: fa.FaCheckCircle };
// white = color.text.inverse, muted = color.text.subtle
const COLORS = { white: "#FFFFFF", muted: "#505258" };

(async () => {
  for (const [name, Icon] of Object.entries(ICONS)) {
    for (const [cname, hex] of Object.entries(COLORS)) {
      const svg = RDS.renderToStaticMarkup(React.createElement(Icon, { color: hex, size: 256 }));
      await sharp(Buffer.from(svg)).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png().toFile(path.join(OUT, `${name}_${cname}.png`));
    }
  }
  console.log("assets ->", OUT);
})();
