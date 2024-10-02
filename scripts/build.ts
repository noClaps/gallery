import { $ } from "bun";
import sharp from "sharp";

await $`mkdir -p dist/_images`;
await $`cp src/favicon.ico dist`;

const rw = new HTMLRewriter();

// Inline styles
rw.on(`link[rel="stylesheet"]`, {
	async element(el) {
		const href = el.getAttribute("href");
		if (!href) throw new Error("Style link not found");

		const styles = await Bun.file(`src${href}`).text();
		el.replace(`<style>${styles}</style>`, {
			html: true,
		});
	},
});

// Optimise images
rw.on("img", {
	async element(el) {
		const alt = el.getAttribute("alt") ?? "";
		const image = el.getAttribute("src") ?? "";

		const imgHash = Bun.hash(await Bun.file(image).arrayBuffer());
		const filename = `${imgHash}.avif`;

		const { height, width } = await sharp(
			new Uint8Array(await Bun.file(image).arrayBuffer()),
		).metadata();
		if (!width || !height) {
			throw new Error(`Image has no width or height: ${image}`);
		}

		if (!(await Bun.file(`dist/_images/${filename}`).exists())) {
			console.log("Optimising image:", image);
			const buf = await sharp(image).resize(1000).avif().toBuffer();
			Bun.write(`dist/_images/${filename}`, buf);
		} else {
			console.log("Skipped optimising image:", image);
		}

		const fileExt = Bun.file(image).type.replace("image/", "");
		const originalFilename = `${imgHash}.${fileExt}`;

		if (!(await Bun.file(`dist/_images/${originalFilename}`).exists())) {
			console.log("Copying original image:", image);
			Bun.write(`dist/_images/${originalFilename}`, Bun.file(image));
		} else {
			console.log("Skipped copying image:", image);
		}

		el.replace(
			`<a href="/_images/${originalFilename}" target="_blank"><img alt="${alt}" title="${alt}" loading="lazy" decoding="async" src="/_images/${filename}" height="${height}" width="${width}"></a>`,
			{ html: true },
		);
	},
});

const html = rw.transform(await Bun.file("src/index.html").text());
Bun.write("dist/index.html", html);
