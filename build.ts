import sharp from "sharp";

console.log("Writing CSS...\n");
Bun.write("./dist/style.css", Bun.file("./src/style.css")).then(() => {
    console.log("Done writing CSS!\n");
});

console.log("Copying favicon...\n");
Bun.write("./dist/favicon.ico", Bun.file("./src/favicon.ico")).then(() => {
    console.log("Done copying favicon!\n");
});

const rw = new HTMLRewriter();
const glob = new Bun.Glob("*.{jpg,jpeg}");
sharp.cache(false);

rw.on("section", {
    async element(element) {
        const year = element.getAttribute("class");
        const images = Array.from(glob.scanSync(`./src/assets/${ year }`));

        for (const img of images) {
            const filename = img.replace(/jpe?g/, "avif");
            await sharp(`./src/assets/${ year }/${ img }`).metadata().then(metadata => {
                element.append(`<img src="/images/${ filename }" width="${ metadata.width }" height="${ metadata.height }" loading="lazy" decoding="async">`, { html: true });
            });

            if (!(await Bun.file(`./node_modules/.cache/images/${ filename }`).exists())) {
                sharp(`./src/assets/${ year }/${ img }`)
                    .toFormat("avif")
                    .toBuffer((_, buffer) => {
                        Bun.write(`./dist/images/${ filename }`, buffer);
                        Bun.write(`./node_modules/.cache/images/${ filename }`, buffer);
                        console.log(`Optimised ${ filename }`);
                    });
            } else {
                console.log(`${ filename } already exists!`);
                Bun.write(`./dist/images/${ filename }`, Bun.file(`./node_modules/.cache/images/${ filename }`));
            }
        }
    },
});

console.log("Building HTML and optimising images...\n");
Bun.write("./dist/index.html", rw.transform(new Response(Bun.file("./src/index.html")))).then(() => {
    console.log("Done building HTML and optimising images!\n");
});