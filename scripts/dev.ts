import gallery from "../src/index.html";

const server = Bun.serve({
  static: {
    "/": gallery,
  },
  development: true,
  fetch() {
    return new Response("Not found", { status: 404 });
  },
});

console.log(`Server running on ${server.url}`);
