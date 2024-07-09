import { $ } from "bun";
import { watch } from "node:fs";

async function serve() {
  await $`bun scripts/build.ts`;

  return Bun.serve({
    async fetch(req) {
      const path = new URL(req.url).pathname;

      if (path === "/") return new Response(Bun.file("dist/index.html"));

      if (await Bun.file(`dist${path}`).exists()) {
        return new Response(Bun.file(`dist${path}`));
      }

      return new Response("Not found", { status: 404 });
    },
    reusePort: true,
  });
}

serve().then((server) => {
  console.log(`Server running on ${server.url}`);
});

watch(
  `${import.meta.dir}/../src`,
  { recursive: true },
  async (event, filename) => {
    console.log(`Detected ${event} in ${filename}`);
    serve();
  },
);
