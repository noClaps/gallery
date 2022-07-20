# Gallery
A website to showcase some cool photos I've taken.

## Building from source
1. Clone this repository
    ```sh
    git clone https://github.com/noClaps/gallery.git && cd gallery
    ```
2. Install `thumbsup`
    ```sh
    npm install -g thumbsup
    ```
3. Make a folder called `Photos` and put all of your photos into it.
4. Run the command to generate your files.
    ```bash
    thumbsup --config json
    ```
5. Open the generated `index.html` file in the `dist` directory to see the output.
6. You can modify `config.json` and files in the `theme` folder to customise your website.
7. Enjoy!

## Credits
This gallery was made using [thumbsup](https://thumbsup.github.io/), an [open source](https://github.com/thumbsup/thumbsup) static web gallery generator.

## Licenses
All of the software in this repository is licensed under [the Unlicense](LICENSE.Unlicense).

All of the images are licensed under [Creative Commons Zero v1.0 Universal](LICENSE.CC0-1.0).

The favicon is from [Google's Material Symbols and Icons](https://fonts.google.com/icons) and is licensed under the [Apache License](https://www.apache.org/licenses/LICENSE-2.0.html).

The static site generator for this website, thumbsup, is licensed under the [MIT License](https://github.com/thumbsup/thumbsup/blob/master/LICENSE.md)