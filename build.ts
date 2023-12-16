import sharp from "sharp";

const rewriter = new HTMLRewriter();
const glob = new Bun.Glob("*.{jpg,jpeg}");

rewriter.on("section", {
    element(element) {
        const year = element.getAttribute("class");
        const images = glob.scanSync({ cwd: `./src/assets/${ year }` });
        console.log(year);

        for (const image of images) {
            const filename = image.replace(/jpe?g/, "avif");
            sharp(`./src/assets/${ year }/${ image }`)
                .toFormat("avif")
                .toFile(`./dist/images/${ filename }`, (_, info) => {
                    element.append(`<img src="images/${ filename }" width="${ info.width }" height="${ info.height }" loading="lazy" decoding="async">`, { html: true });
                    console.log("Optimised image");
                });
        }
    },
});

await Bun.write("./dist/index.html", Bun.file("./src/index.html"));
await Bun.write("./dist/style.css", Bun.file("./src/style.css"));
await Bun.write("./dist/favicon.ico", Bun.file("./src/favicon.ico"));
await Bun.write("./src/index.html", rewriter.transform(new Response(await Bun.file("./src/index.html").text())));