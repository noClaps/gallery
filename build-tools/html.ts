import { Glob, file, write } from "bun";
import sharp from "sharp";

const rewriter = new HTMLRewriter();
const glob = new Glob("*.{jpg,jpeg}");

rewriter.on("section", {
    async element(element) {
        const year = element.getAttribute("class");
        const imgFiles = Array.from(glob.scanSync({ cwd: `./src/assets/${ year }` }));

        for (const imgFile of imgFiles) {
            const filename = imgFile.replace(/jpe?g/, "avif");
            await sharp(`./dist/images/${ filename }`).metadata().then((metadata) => {
                console.log(`${ filename } already exists!`);
                element.append(`<img src="/images/${ filename }" width="${ metadata.width }" height="${ metadata.height }" loading="lazy" decoding="async">`, { html: true });
            }).catch(() => {
                sharp(`./src/assets/${ year }/${ imgFile }`)
                    .toFormat("avif")
                    .toBuffer((_, buffer, info) => {
                        Bun.write(`./dist/images/${ filename }`, buffer);
                        element.append(`<img src="/images/${ filename }" width="${ info.width }" height="${ info.height }" loading="lazy" decoding="async">`, { html: true });
                        console.log(`Optimised ${ filename }`);
                    });
            }
            );
        }
    },
});

write("./dist/index.html", rewriter.transform(new Response(file("./src/pages/index.html"))));