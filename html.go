package main

import (
	"fmt"
	"log"
	"os"
	"slices"
	"strings"
	"sync"

	"golang.org/x/net/html"
)

var wg sync.WaitGroup

func parseHTML() error {
	htmlFile, err := os.Open("src/index.html")
	if err != nil {
		return err
	}
	defer htmlFile.Close()
	node, err := html.Parse(htmlFile)
	if err != nil {
		return err
	}
	processNode(node)

	outputFile, err := os.Create("dist/index.html")
	if err != nil {
		return err
	}
	defer outputFile.Close()
	return html.Render(outputFile, node)
}

func processNode(node *html.Node) {
	for child := range node.Descendants() {
		if child.Data != "link" && child.Data != "img" {
			continue
		}

		wg.Add(1)
		go func() {
			defer wg.Done()
			if child.Data == "link" && slices.ContainsFunc(child.Attr, func(attr html.Attribute) bool {
				return attr.Key == "rel" && attr.Val == "stylesheet"
			}) {
				hrefIndex := slices.IndexFunc(child.Attr, func(attr html.Attribute) bool {
					return attr.Key == "href"
				})
				if hrefIndex == -1 {
					return
				}
				href := child.Attr[hrefIndex].Val
				styles, err := os.ReadFile("src/" + href)
				if err != nil {
					log.Println(err)
				}
				styleNode, err := html.ParseFragment(strings.NewReader("<style>"+string(styles)+"</style>"), child.Parent)
				if err != nil {
					log.Println(err)
				}
				child.Parent.AppendChild(styleNode[0])
				child.Parent.RemoveChild(child)
			}

			if child.Data == "img" {
				srcIndex := slices.IndexFunc(child.Attr, func(attr html.Attribute) bool {
					return attr.Key == "src"
				})
				if srcIndex == -1 {
					return
				}
				src := child.Attr[srcIndex].Val

				width, height, fileName, err := parseImage("src/" + src)
				if err != nil {
					log.Println(err)
				}
				if err := copyFile("dist/_images/"+fileName, ".cache/"+fileName); err != nil {
					log.Println(err)
				}

				child.Attr = append(
					child.Attr,
					html.Attribute{Key: "width", Val: fmt.Sprint(width)},
					html.Attribute{Key: "height", Val: fmt.Sprint(height)},
					html.Attribute{Key: "loading", Val: "lazy"},
					html.Attribute{Key: "decoding", Val: "async"},
				)
				child.Attr[srcIndex] = html.Attribute{Key: "src", Val: "/_images/" + fileName}

				altIndex := slices.IndexFunc(child.Attr, func(attr html.Attribute) bool {
					return attr.Key == "alt"
				})
				if altIndex == -1 {
					return
				}
				alt := child.Attr[altIndex].Val

				child.Attr = append(
					child.Attr,
					html.Attribute{Key: "title", Val: alt},
				)
			}

		}()
	}
	wg.Wait()
}
