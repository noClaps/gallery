import { $ } from "bun";
import sharp from "sharp";

await $`mkdir -p dist/_images`;
await $`cp src/style.css dist`;
await $`cp src/favicon.ico dist`;

// Optimise images
const html = new HTMLRewriter()
  .on("img", {
    async element(el) {
      const alt = el.getAttribute("alt") ?? "";
      const image = el.getAttribute("src") ?? "";

      const imgHash = Bun.hash(await Bun.file(image).arrayBuffer());
      const filename = `${imgHash}.avif`;

      const { height, width } = await sharp(
        new Uint8Array(await Bun.file(image).arrayBuffer()),
      ).metadata();
      if (!width || !height) {
        throw new Error(`Image has no width or height: ${image}`);
      }

      if (!(await Bun.file(`dist/_images/${filename}`).exists())) {
        console.log("Optimising image:", image);
        const buf = await sharp(image).resize(1000).avif().toBuffer();
        Bun.write(`dist/_images/${filename}`, buf);
      } else {
        console.log("Skipped image:", image);
      }

      const fileExt = Bun.file(image).type.replace("image/", "");
      const originalFilename = `${imgHash}.${fileExt}`;
      Bun.write(`dist/_images/${originalFilename}`, Bun.file(image));

      el.replace(
        `<a href="/_images/${originalFilename}" target="_blank">
        <img alt="${alt}" title="${alt}" loading="lazy" decoding="async" src="/_images/${filename}" height="${height}" width="${width}">
        </a>`,
        { html: true },
      );
    },
  })
  .transform(await Bun.file("src/index.html").text());

Bun.write("dist/index.html", html);
