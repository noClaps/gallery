all: prepare-directories copy-static-files build-html

prepare-directories:
	@mkdir -p ./dist

build-html:
	@echo "Building HTML and images"
	@bun run ./scripts/build-html.ts
	@cp -r ./src/assets ./dist/
	@echo "Done!"

copy-static-files:
	@echo "Copying static files"
	@cp ./src/style.css ./dist/style.css
	@cp ./src/favicon.ico ./dist/favicon.ico
	@echo "Done!"
