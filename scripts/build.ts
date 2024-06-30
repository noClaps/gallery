import { $ } from "bun";
import sharp from "sharp";

await $`mkdir -p dist`;
await $`cp src/style.css dist`;
await $`cp src/favicon.ico dist`;

// Build HTML
await $`mkdir -p node_modules/.cache/_images`;
const html = new HTMLRewriter().on("img", {
  async element(el) {
    el.setAttribute("title", el.getAttribute("alt") ?? "");
    el.setAttribute("loading", "lazy");
    el.setAttribute("decoding", "async");

    const image = el.getAttribute("src") ?? "";
    const filename = `${Bun.hash(await Bun.file(image).arrayBuffer())}.avif`;
    el.setAttribute("src", `/_images/${filename}`);

    if (await Bun.file(`node_modules/.cache/_images/${filename}`).exists()) {
      console.log("Skipped image:", image);
    } else {
      console.log("Optimising image:", image);
      await sharp(image)
        .avif()
        .toFile(`node_modules/.cache/_images/${filename}`);
    }

    await sharp(image)
      .metadata()
      .then((info) => {
        info.height && el.setAttribute("height", `${info.height}`);
        info.width && el.setAttribute("width", `${info.width}`);
      });
  },
});

Bun.write(
  "dist/index.html",
  await html.transform(new Response(Bun.file("src/index.html"))).text(),
);

await $`cp -r node_modules/.cache/_images dist/`;
