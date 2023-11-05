import { Pixel, Colors } from "./pixel";
import { pixelTrueColor } from "./util";
import { Board, printBoard, setupBoard } from "./board";

let board: Board = { pixels: [], mosaics: [] };

const checked: Pixel[] = [];

const getMosiacs = (board: Board) => {
  for (let i = 0; i < board.pixels.length; i++) {
    for (let j = 0; j < board.pixels[i].length; j++) {
      const pixel = board.pixels[i][j];
      if (checked.some((c) => c === pixel)) continue;
      checked.push(pixel);
      if (pixel.color === Colors.Empty || pixel.color === Colors.White) {
        continue;
      }
      const neighbors = pixel.getNeighbors();
      const otherColors = neighbors.filter(
        (n) =>
          n &&
          n.color !== pixel.color &&
          n.color !== Colors.White &&
          n.color !== Colors.Empty
      );
      if (otherColors.length !== 2 && otherColors.length !== 0) {
        continue;
      }
      const multiColor = otherColors.length === 2;
      if (multiColor && pixel.sameColorNeighbors().length !== 0) continue;
      // same color mosaics
      const matchingNeighbors: Pixel[] = multiColor
        ? pixel.otherColorNeighbors()
        : pixel.sameColorNeighbors();
      if (matchingNeighbors.length !== 2) {
        continue;
      }
      const n1 = matchingNeighbors[0];
      const n2 = matchingNeighbors[1];
      if (!match(n1, n2, multiColor)) continue;
      if (!match(n2, n1, multiColor)) continue;
      matchingNeighbors.forEach((n) => {
        checked.push(n);
      });
      board.mosaics.push([board.pixels[i][j], n1, n2]);
    }
  }
};

const match = (n1: Pixel, n2: Pixel, multiColor: boolean): boolean => {
  // if multiColor we just swap sameColor and otherColor
  const n1Diff = multiColor
    ? n1.sameColorNeighbors()
    : n1.otherColorNeighbors();
  if (n1Diff.length > 0) {
    // if n1 has other color neighbors,
    return false;
  }
  const n1Same = multiColor
    ? n1.otherColorNeighbors()
    : n1.sameColorNeighbors();
  if (n1Same.length !== 2) return false;
  if (!n1Same.some((n) => n === n2)) return false;
  return true;
};

setupBoard(board);
getMosiacs(board);
printBoard(board);
board.mosaics.forEach((m) => {
  if (m[0].color === m[1].color) {
    console.log(
      pixelTrueColor(m[0].color, false) +
        m.map((p) => `${p.y},${p.x}`).join(" ")
    );
  } else {
    console.log(
      pixelTrueColor(m[0].color, false) +
        m.map((p) => `${pixelTrueColor(p.color, false)}${p.y},${p.x}`).join(" ")
    );
  }
});
