import { Glob } from "bun";
import { transform, Features } from "lightningcss";
import sharp from "sharp";

// Build CSS
const { code } = transform({
    filename: "style.css",
    code: new Uint8Array(await Bun.file("./src/style.css").arrayBuffer()),
    minify: true,
    include: Object.values(Features).reduce((a, b) => a | b, 0)
});
Bun.write("./dist/style.css", code);

// Copy favicon
Bun.write("./dist/favicon.ico", Bun.file("./src/favicon.ico"));

// Build HTML
const glob = new Glob("*.{jpg,jpeg}");
const html = new HTMLRewriter().on("section", {
    async element(el) {
        const year = el.getAttribute("class");
        const images = [...glob.scanSync({ cwd: `./src/assets/${ year }` })];

        let string = ``;
        for (const image of images) {
            await sharp(`./src/assets/${ year }/${ image }`).metadata().then((metadata) => {
                string += `<img
                    src="/assets/${ image.replace(/jpe?g/, "avif") }"
                    ${ metadata.height ? `height=${ metadata.height }` : "" } 
                    ${ metadata.width ? `width=${ metadata.width }` : "" }
                    loading=lazy
                    decoding=async>`;
            });
        }
        el.setInnerContent(string, { html: true });
    }
}).transform(new Response(await Bun.file("./src/index.html").text()));

Bun.write("./dist/index.html", html);