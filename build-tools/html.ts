const rewriter = new HTMLRewriter();
rewriter.on("*", {
    async comments(comment) {
        const html = await Bun.file(`./tmp/${ comment.text.replaceAll(" ", "") }.html`).text();
        comment.replace(html, { html: true });
    },
});

Bun.write("./dist/index.html", rewriter.transform(new Response(Bun.file("./src/pages/index.html"))));