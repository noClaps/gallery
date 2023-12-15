import { Glob } from "bun";
import sharp from "sharp";

const glob = new Glob("*.{jpg,jpeg}");
const years = [2019, 2021, 2022, 2023];

for (const year of years) {
    const writer = Bun.file(`./tmp/images-${ year }.html`).writer();

    const imgFiles = Array.from(glob.scanSync({ cwd: `./src/assets/${ year }` }));
    for (const imgFile of imgFiles) {
        const filename = imgFile.replace(/jpe?g/, "avif");
        sharp(`./src/assets/${ year }/${ imgFile }`)
            .toFormat("avif")
            .toBuffer((_, buffer, info) => {
                Bun.write(`./dist/images/${ filename }`, buffer);
                writer.write(`<img src="/images/${ filename }" width="${ info.width }" height="${ info.height }" loading="lazy" decoding="async">`);
                writer.flush();
                console.log(`Optimised ${ filename }`);
            });
    }
}