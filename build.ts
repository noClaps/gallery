import { HTMLRewriter } from "htmlrewriter";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { glob, writeFile } from "node:fs/promises";
import sharp from "sharp";

const html = readFileSync("src/index.html");
let images: Record<string, { base64: string; width: number; height: number }> =
  {};
for await (let entry of glob("src/assets/**/*.{jpg,jpeg,png}")) {
  console.log(`Optimising image: ${entry}`);
  entry = entry.replace("src/", "./");
  if (existsSync(`.cache/${entry}`)) {
    const buf = readFileSync(`.cache/${entry}`);
    const base64 = buf.toString("base64");
    const { width, height } = await sharp(buf).metadata();
    images[entry] = { base64, width: width, height: height };
  } else {
    const buf = await sharp(`src/${entry}`).resize(1000).avif().toBuffer();
    mkdirSync(`.cache/${entry.split("/").slice(0, -1).join("/")}`, {
      recursive: true,
    });
    writeFile(`.cache/${entry}`, buf);
    const base64 = buf.toString("base64");
    const { width, height } = await sharp(buf).metadata();
    images[entry] = { base64, width: width, height: height };
  }
}

const outputHtml = new HTMLRewriter()
  .on("link[rel=stylesheet]", {
    element(el) {
      const path = el.getAttribute("href")!;

      console.log(`Embedding CSS from: ${path}`);
      const css = readFileSync(`src/${path}`);
      el.replace(`<style>${css}</style>`, { html: true });
    },
  })
  .on("img", {
    element(el) {
      const src = el.getAttribute("src")!;
      const alt = el.getAttribute("alt")!;

      const { base64, width, height } = images[src];

      el.setAttribute("width", `${width}`);
      el.setAttribute("height", `${height}`);
      el.setAttribute("src", `data:image/avif;base64,${base64}`);
      el.setAttribute("title", alt);
    },
  })
  .transform(new Response(html));

mkdirSync("dist");
writeFile("dist/index.html", await outputHtml.bytes());
