import base64
from os import makedirs

from bs4 import BeautifulSoup
from pyvips import Image

html = None
with open("./src/index.html") as f:
    html = f.read()

html_parser = BeautifulSoup(html, features="html.parser")

link = html_parser.find("link", rel="stylesheet")
if link:
    href = link["href"]
    css = None
    with open(f"./src/{href}") as f:
        css = f.read()

    style = html_parser.new_tag("style")
    style.string = css
    link.replace_with(style)

for img in html_parser.find_all("img"):
    src = str(img["src"]).replace("./", "src/")
    print(f"Optimising {src}")
    img["title"] = img["alt"]

    image = Image.thumbnail(src, 1000) # pyright:ignore
    assert type(image) is Image

    width = image.get("width")
    height = image.get("height")

    b = image.write_to_buffer('.avif')
    assert type(b) is bytes

    b64 = base64.b64encode(b).decode()

    img["width"] = str(width)
    img["height"] = str(height)
    img["src"] = f"data:image/avif;base64,{b64}"

makedirs("dist")
with open("dist/out.html", 'w') as f:
    f.write(str(html_parser))
