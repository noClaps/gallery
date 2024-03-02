import sharp from "sharp";

// Build HTML
const glob = new Bun.Glob("*.{jpg,jpeg,png}");

const rewriter = new HTMLRewriter();
const html = rewriter.on("section", {
  async element(element) {
    const year = +element.getAttribute("class")!;
    const images = Array.from(glob.scanSync({ cwd: `./src/assets/${year}` }))
      .toSorted()
      .toReversed();

    for (const image of images) {
      console.log(image);
      element.append(
        `<img src="/cdn-cgi/image/f=avif,q=100/assets/${year}/${image}" loading="lazy" decoding="async">`,
        { html: true },
      );
    }
  },
});

Bun.write(
  "./dist/index.html",
  html.transform(new Response(await Bun.file("./src/index.html").text())),
);
