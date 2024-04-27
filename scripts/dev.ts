import { $ } from "bun";
import { watch } from "fs";

async function serve() {
  await $`bun scripts/build.ts`;

  return Bun.serve({
    fetch(req) {
      const path = new URL(req.url).pathname;

      if (path === "/") return new Response(Bun.file("dist/index.html"));
      return new Response(Bun.file(`dist${path}`));
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
