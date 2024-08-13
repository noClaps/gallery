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
      const filename = `${imgHash}.webp`;

      console.log("Optimising image:", image);
      const { height, width } = await sharp(image)
        .webp()
        .toFile(`dist/_images/${filename}`);

      const fileExt = Bun.file(image).type.replace("image/", "");
      const originalFilename = `${imgHash}.${fileExt}`;
      Bun.write(`dist/_images/${originalFilename}`, Bun.file(image));

      el.replace(
        `<a href="/_images/${originalFilename}" target="_blank"><img alt="${alt}" title="${alt}" loading="lazy" decoding="async" src="/_images/${filename}" height="${height}" width="${width}"></a>`,
        { html: true },
      );
    },
  })
  .transform(await Bun.file("src/index.html").text());

Bun.write("dist/index.html", html);
