import sharp from "sharp";

// Build HTML
const glob = new Bun.Glob("*.{jpg,jpeg}");

const rewriter = new HTMLRewriter();
const html = rewriter.on("section", {
    async element(element) {
        const year = +element.getAttribute("class")!;
        const images = Array.from(glob.scanSync({ cwd: `./src/assets/${ year }` })).toSorted().toReversed();

        for (const image of images) {
            const hash = Bun.hash(await Bun.file(`./src/assets/${ year }/${ image }`).arrayBuffer());
            const filename = `${ hash }.avif`;

            if (!await Bun.file(`./node_modules/_images/${ filename }`).exists()) {
                console.log("Optimising image:", image);
                await sharp(`./src/assets/${ year }/${ image }`).avif().toBuffer((err, buffer) => {
                    if (err) {
                        console.error(err);
                    }

                    Bun.write(`./node_modules/_images/${ filename }`, buffer);
                }).metadata().then((info) => {
                    element.append(`<img src="/_images/${ filename }" width="${ info.width }" height="${ info.height }" loading="lazy" decoding="async">`, { html: true });
                });
            } else {
                console.log("Skipped image:", image);
                const info = await sharp(`./node_modules/_images/${ filename }`).metadata();
                element.append(`<img src="/_images/${ filename }" width="${ info.width }" height="${ info.height }" loading="lazy" decoding="async">`, { html: true });
            }

        }
    }
});

Bun.write("./dist/index.html", html.transform(new Response(await Bun.file("./src/index.html").text())));
