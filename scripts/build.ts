import { $ } from "bun";
import imageSize from "image-size";

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

      if (!(await Bun.file(`dist/_images/${filename}`).exists())) {
        console.log("Optimising image:", image);
        await $`avifenc --min 0 --max 63 -a end-usage=q -a cq-level=18 -a tune=ssim -j all ${image} dist/_images/${filename}`;
      } else {
        console.log("Skipped image:", image);
      }
      const { height, width } = imageSize(
        new Uint8Array(await Bun.file(image).arrayBuffer()),
      );

      const fileExt = Bun.file(image).type.replace("image/", "");
      const originalFilename = `${imgHash}.${fileExt}`;
      Bun.write(`dist/_images/${originalFilename}`, Bun.file(image));

      el.replace(
        `<a href="/_images/${originalFilename}" target="_blank"><img alt="${alt}" title="${alt}" loading="lazy" decoding="async" src="/_images/${filename}" height="${height ?? ""}" width="${width ?? ""}"></a>`,
        { html: true },
      );
    },
  })
  .transform(await Bun.file("src/index.html").text());

Bun.write("dist/index.html", html);
