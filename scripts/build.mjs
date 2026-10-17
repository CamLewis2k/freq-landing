import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const portable = process.argv.includes("--portable");
const data = (path, mime) =>
  "data:" +
  mime +
  ";base64," +
  readFileSync(resolve(root, path)).toString("base64");
const asset = (path, mime) => portable ? data(path, mime) : "/" + path;
const css = readFileSync(resolve(root, "src/styles.css"), "utf8")
  .replace("__CREATOR_IMAGE__", () =>
    asset("assets/creator-worlds-v3.webp", "image/webp"),
  )
  .replace("__DISPLAY_FONT__", () =>
    asset("assets/fonts/BarlowCondensed-ExtraBold.ttf", "font/ttf"),
  )
  .replace("__BODY_FONT__", () => asset("assets/fonts/Manrope.ttf", "font/ttf"));
const js = readFileSync(resolve(root, "src/app.js"), "utf8");
let html = readFileSync(resolve(root, "src/index.template.html"), "utf8")
  .replace("/*__STYLES__*/", () => css)
  .replace("/*__SCRIPT__*/", () => js);
if (portable) html = html.replace(/<link rel="preload"[^>]+>\s*/g, "");
const licenses = ["assets/fonts/Barlow-OFL.txt", "assets/fonts/Manrope-OFL.txt"].map(path => readFileSync(resolve(root,path),"utf8")).join("\n\n");
const output = portable ? "freq-preview.html" : "index.html";
writeFileSync(resolve(root, output), html.replace("</head>", () => "<!-- Bundled font licenses\n"+licenses+"\n-->\n</head>"));
console.log(portable ? "Built portable Freq preview." : "Built Freq homepage with separately cacheable artwork and fonts.");
