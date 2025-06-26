import sharp from "sharp";

await Bun.$`mkdir -p .cache`;

const rw = new HTMLRewriter();

rw.on("link[rel=stylesheet]", {
  async element(el) {
    const href = el.getAttribute("href");
    if (!href) return;

    const [styles, font] = await Bun.build({
      entrypoints: [`src/${href}`],
      minify: true,
    }).then((bo) => bo.outputs);
    el.replace(`<style>${await styles.text()}</style>`, {
      html: true,
    });
    Bun.write(`dist/${font.path}`, await font.arrayBuffer());
  },
});

// Optimise images
rw.on("img", {
  async element(el) {
    const alt = el.getAttribute("alt") ?? "";
    const image = `src/${el.getAttribute("src")}`;

    const imgHash = Bun.hash
      .rapidhash(await Bun.file(image).arrayBuffer())
      .toString(36);
    const filename = `${imgHash}.avif`;

    const { height, width } = await sharp(
      new Uint8Array(await Bun.file(image).arrayBuffer()),
    ).metadata();
    if (!width || !height) {
      throw new Error(`Image has no width or height: ${image}`);
    }

    if (!(await Bun.file(`.cache/${filename}`).exists())) {
      console.log("Optimising image:", image);
      await sharp(image).resize(1000).avif().toFile(`.cache/${filename}`);
    } else {
      console.log("Skipped optimising image:", image);
    }
    Bun.write(`dist/_images/${filename}`, Bun.file(`.cache/${filename}`));

    el.replace(
      `<img alt="${alt}" title="${alt}" loading="lazy" decoding="async" src="/_images/${filename}" height="${height}" width="${width}">`,
      { html: true },
    );
  },
});

const html = rw.transform(await Bun.file("src/index.html").text());
const miniHtml = html.replaceAll(/>\s+</g, "><").replaceAll(/\s+/g, " ");
Bun.write("dist/index.html", miniHtml);
