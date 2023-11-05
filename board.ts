import { Pixel, Colors } from "./pixel";

export interface Board {
  pixels: Pixel[][];
  mosaics: Pixel[][];
}

export const printBoard = (board: Board) => {
  let str = "";
  for (let i = board.pixels.length - 1; i > -1; i--) {
    str += " ".repeat((i + 1) % 2) + board.pixels[i].join(" ") + "\n";
  }
  console.log(str);
};

export const setupBoard = (board: Board) => {
  board.pixels = [];
  board.mosaics = [];
  for (let i = 0; i < 11; i++) {
    board.pixels.push([]);
    for (let j = 0; j < 6 + (i % 2); j++) {
      board.pixels[i].push(new Pixel(i, j, board));
    }
  }
  board.pixels[0] = [
    Colors.Yellow,
    Colors.White,
    Colors.White,
    Colors.Yellow,
    Colors.Yellow,
    Colors.Empty,
  ].map((c, i) => new Pixel(0, i, board, c));
  board.pixels[1] = [
    Colors.Purple,
    Colors.Green,
    Colors.White,
    Colors.White,
    Colors.Yellow,
    Colors.Empty,
    Colors.Empty,
  ].map((c, i) => new Pixel(1, i, board, c));
  board.pixels[2] = [
    Colors.White,
    Colors.Empty,
    Colors.White,
    Colors.White,
    Colors.Empty,
    Colors.Empty,
  ].map((c, i) => new Pixel(2, i, board, c));
  return board;
};
