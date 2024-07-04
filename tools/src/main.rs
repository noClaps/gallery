use std::fs::read;

use clap::Parser;
use ravif::{Encoder, Img};
use rgb::RGBA;
use rgb::RGBA8;
use zune_jpeg::JpegDecoder;
use zune_png::PngDecoder;

/// A command to transform images
#[derive(Parser, Debug)]
#[command(version, about)]
struct Args {
    /// The input image file
    #[arg(short, long)]
    input: String,

    /// The output image file
    #[arg(short, long)]
    output: String,
}

fn main() {
    let args = Args::parse();

    let data_jpeg = read(args.input).unwrap();
    let mut decoder_jpeg = JpegDecoder::new(&data_jpeg);
    let pixels_jpeg = decoder_jpeg.decode().unwrap();
    let (width_jpeg, height_jpeg) = decoder_jpeg.dimensions().unwrap();

    let data_png = read(args.input).unwrap();
    let mut decoder_png = PngDecoder::new(&data_png);
    let pixels_png = decoder_png.decode_raw().unwrap();
    let (width_png, height_png) = decoder_png.get_dimensions().unwrap();

    println!("{:?}", pixels_jpeg);

    let res = Encoder::new().encode_rgba(Img::new(&pixels_jpeg, width_jpeg, height_jpeg));
}
