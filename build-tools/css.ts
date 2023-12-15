import { transform, Features } from "lightningcss";

const { code } = transform({
    filename: "style.css",
    code: Buffer.from(await Bun.file("./src/styles/style.css").arrayBuffer()),
    minify: true,
    include: Object.values(Features).reduce((sum, a) => sum + a, 0)
});

Bun.write("./dist/style.css", code.toString());