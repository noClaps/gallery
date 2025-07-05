package main

import (
	"io"
	"log"
	"os"
)

func main() {
	if err := os.RemoveAll("dist"); err != nil {
		log.Fatalln(err)
	}
	if err := os.MkdirAll(".cache", 0o755); err != nil {
		log.Fatalln(err)
	}
	if err := os.MkdirAll("dist/_images", 0o755); err != nil {
		log.Fatalln(err)
	}
	if err := parseHTML(); err != nil {
		log.Fatalln(err)
	}
	if err := copyFile("dist/InterVariable.woff2", "src/InterVariable.woff2"); err != nil {
		log.Fatalln(err)
	}
}

func copyFile(dst, src string) error {
	outFile, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer outFile.Close()

	inFile, err := os.Open(src)
	if err != nil {
		return err
	}
	defer inFile.Close()

	_, err = io.Copy(outFile, inFile)
	return err
}
