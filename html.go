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
	var processNode func(node *html.Node) error
	processNode = func(node *html.Node) error {
		if node == nil {
			return nil
		}

		for child := range node.ChildNodes() {
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
					styleNode, err := html.ParseFragment(strings.NewReader("<style>"+string(styles)+"</style>"), node)
					if err != nil {
						log.Println(err)
					}
					node.AppendChild(styleNode[0])
					node.RemoveChild(child)
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

			for nested := range child.ChildNodes() {
				err := processNode(nested)
				if err != nil {
					return err
				}
			}
		}
		wg.Wait()

		return nil
	}
	if err := processNode(node); err != nil {
		return err
	}

	outputFile, err := os.Create("dist/index.html")
	if err != nil {
		return err
	}
	defer outputFile.Close()
	return html.Render(outputFile, node)
}
