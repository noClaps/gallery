Bun.serve({
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

console.log("Server running on http://localhost:3000");
