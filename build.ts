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

rw.on("section", {
    async element(element) {
        const year = element.getAttribute("class");
        const images = Array.from(glob.scanSync(`./src/assets/${ year }`));

        for (const img of images) {
            const filename = img.replace(/jpe?g/, "avif");
            await sharp(`./dist/images/${ filename }`).metadata().then((metadata) => {
                console.log(`${ filename } already exists!`);
                element.append(`<img src="/images/${ filename }" width="${ metadata.width }" height="${ metadata.height }" loading="lazy" decoding="async">`, { html: true });
            }).catch(() => {
                sharp(`./src/assets/${ year }/${ img }`)
                    .toFormat("avif")
                    .toBuffer((_, buffer, info) => {
                        Bun.write(`./dist/images/${ filename }`, buffer);
                        element.append(`<img src="/images/${ filename }" width="${ info.width }" height="${ info.height }" loading="lazy" decoding="async">`, { html: true });
                        console.log(`Optimised ${ filename }`);
                    });
            });
        }
    },
});

console.log("Building HTML and optimising images...\n");
Bun.write("./dist/index.html", rw.transform(new Response(Bun.file("./src/index.html")))).then(() => {
    console.log("Done building HTML and optimising images!\n");
});