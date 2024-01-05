all: prepare-directories copy-static-files build-css build-html

prepare-directories:
	@mkdir -p ./dist

build-html:
	@echo "Building HTML and images"
	@bun run ./scripts/build-html.ts
	@cp -r ./node_modules/.astro/ ./dist/_images/
	@echo "Done!"

build-css:
	@echo "Building CSS"
	@bun run ./scripts/build-css.ts
	@echo "Done!"

copy-static-files:
	@echo "Copying static files"
	@cp ./src/favicon.ico ./dist/favicon.ico
	@echo "Done!"
