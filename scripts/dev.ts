import { type Serve } from "bun";
import { watch } from "node:fs";

const serverOptions: Serve = {
	async fetch(req) {
		const path = new URL(req.url).pathname;

		switch (path) {
			case "/":
				return new Response(Bun.file("src/index.html"));

			case "/style.css":
				return new Response(Bun.file("src/style.css"));

			case "/favicon.ico":
				return new Response(Bun.file("src/favicon.ico"));

			default:
				const file = Bun.file(path.slice(1));
				if (await file.exists()) {
					return new Response(file);
				}

				return new Response("Not found", { status: 404 });
		}
	},
};

const server = Bun.serve(serverOptions);

console.log(`Server running on ${server.url}`);

watch(
	`${import.meta.dir}/../src`,
	{ recursive: true },
	async (event, filename) => {
		console.log(`Detected ${event} in ${filename}`);
		server.reload(serverOptions);
		console.log("Reloaded.");
	},
);
