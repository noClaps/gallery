import sharp from "sharp";

const html = Bun.file("src/index.html").arrayBuffer();

const outputHtml = new HTMLRewriter()
  .on("link[rel=stylesheet]", {
    async element(el) {
      const path = el.getAttribute("href")!;

      console.log(`Embedding CSS from: ${path}`);

      const css = await Bun.file(`src/${path}`).text();
      el.replace(`<style>${css}</style>`, { html: true });
    },
  })
  .on("img", {
    async element(el) {
      const src = el.getAttribute("src")!;
      const alt = el.getAttribute("alt")!;

      console.log(`Optimising image: ${src}`);

      let cached = Bun.file(`.cache/${src}`);
      let base64: Promise<string>;
      let metadata: Promise<sharp.Metadata>;

      if (await cached.exists()) {
        const buf = cached.bytes();
        base64 = buf.then((buf) => btoa(String.fromCharCode(...buf)));
        metadata = buf.then((buf) => sharp(buf).metadata());
      } else {
        const avif = sharp(`src/${src}`).resize(1000).avif();
        const buf = avif.toBuffer();
        Bun.write(`.cache/${src}`, await buf);
        base64 = buf.then((buf) => buf.toString("base64"));
        metadata = buf.then((buf) => sharp(buf).metadata());
      }

      el.setAttribute("width", `${(await metadata).width}`);
      el.setAttribute("height", `${(await metadata).height}`);
      el.setAttribute("src", `data:image/avif;base64,${await base64}`);
      el.setAttribute("title", alt);
    },
  })
  .transform(await html);

Bun.write("dist/index.html", outputHtml);

export {};
