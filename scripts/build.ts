import { $ } from "bun";
import sharp from "sharp";

await $`mkdir -p dist`;
await $`cp src/style.css dist`;
await $`cp src/favicon.ico dist`;

// Optimise images
const html = new HTMLRewriter()
  .on("img", {
    async element(el) {
      el.setAttribute("title", el.getAttribute("alt") ?? "");
      el.setAttribute("loading", "lazy");
      el.setAttribute("decoding", "async");

      const image = el.getAttribute("src") ?? "";
      const imgHash = Bun.hash(await Bun.file(image).arrayBuffer());
      const fileExt = Bun.file(image).type.replaceAll("image/", "");
      const filename = `${imgHash}.${fileExt}`;
      el.setAttribute("src", `/_images/${filename}`);

      console.log("Optimising image:", image);
      sharp(image).toBuffer((error, buffer, info) => {
        if (error) throw error;

        Bun.write(`dist/_images/${filename}`, buffer);

        info.height && el.setAttribute("height", `${info.height}`);
        info.width && el.setAttribute("width", `${info.width}`);
      });
    },
  })
  .transform(await Bun.file("src/index.html").text());

Bun.write("dist/index.html", html);
