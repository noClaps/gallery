import { $, type Serve } from "bun";
import { watch } from "node:fs";

const serverOptions: Serve = {
  async fetch(req) {
    const path = new URL(req.url).pathname;

    if (path === "/") return new Response(Bun.file("dist/index.html"));

    if (await Bun.file(`dist${path}`).exists()) {
      return new Response(Bun.file(`dist${path}`));
    }

    return new Response("Not found", { status: 404 });
  },
};

await $`bun scripts/build.ts`;
const server = Bun.serve(serverOptions);

console.log(`Server running on ${server.url}`);

watch(
  `${import.meta.dir}/../src`,
  { recursive: true },
  async (event, filename) => {
    console.log(`Detected ${event} in ${filename}`);
    await $`bun scripts/build.ts`.then(() => {
      server.reload(serverOptions);
      console.log("Reloaded.");
    });
  },
);
