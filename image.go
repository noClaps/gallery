package main

import (
	"crypto/sha1"
	"encoding/hex"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"io"
	"log"
	"os"

	"github.com/anthonynsimon/bild/transform"
	"github.com/gen2brain/avif"
)

func parseImage(path string) (int, int, string, error) {
	file, err := os.Open(path)
	if err != nil {
		return 0, 0, "", err
	}
	defer file.Close()

	fileName, err := calculateFilename(path)
	if err != nil {
		return 0, 0, "", err
	}
	outPath := ".cache/" + fileName
	img, _, err := image.Decode(file)
	if err != nil {
		return 0, 0, "", err
	}
	imgSize := img.Bounds().Size()
	width := 1000
	height := imgSize.Y * 1000 / imgSize.X

	// If image already exists, skip transforming and converting
	if _, err := os.Stat(outPath); err == nil {
		log.Println("Skipped optimising image:", path)
		return width, height, fileName, nil
	}

	log.Println("Optimising image:", path)
	newImg := transform.Resize(img, 1000, height, transform.Lanczos)

	outFile, err := os.Create(outPath)
	if err != nil {
		return 0, 0, "", err
	}
	defer outFile.Close()
	if err := avif.Encode(outFile, newImg); err != nil {
		return 0, 0, "", err
	}

	return width, height, fileName, nil
}

func calculateFilename(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	fileData, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}
	hash := sha1.Sum(fileData)
	fileName := hex.EncodeToString(hash[:]) + ".avif"

	return fileName, nil
}
