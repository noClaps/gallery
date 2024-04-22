Bun.serve({
  fetch(req) {
    const path = new URL(req.url).pathname;

    if (path === "/") return new Response(Bun.file("dist/index.html"));
    return new Response(Bun.file(`dist${path}`));
  },
  reusePort: true,
});

console.log("Server running on http://localhost:3000");
