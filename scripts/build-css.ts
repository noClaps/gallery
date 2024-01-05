import { transform, Features } from "lightningcss";

// Build CSS
const { code } = transform({
    filename: "style.css",
    code: new Uint8Array(await Bun.file("./src/style.css").arrayBuffer()),
    include: Object.values(Features).reduce((a, b) => a | b, 0),
    minify: true
});
Bun.write("./dist/style.css", code);
