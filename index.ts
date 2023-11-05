import { match } from "assert";
import { suffix } from "bun:ffi";
import { constants } from "bun:sqlite";
import { jest } from "bun:test";

class Pixel {
  private offsets: number[][];

  constructor(public y: number, public x: number, public color: number = 0) {
    this.x = x;
    this.y = y;
    this.color = color;
    if (y % 2 == 0) {
      this.offsets = [
        [1, 0], // tl
        [1, 1], // tr
        [0, 1], // r
        [-1, 1], // br
        [-1, 0], // bl
        [0, -1], // l
      ];
    } else {
      this.offsets = [
        [1, -1], // tl
        [1, 0], // tr
        [0, 1], // r
        [-1, 0], // br
        [-1, -1], // bl
        [0, -1], // l
      ];
    }
  }

  getNeighbor(board: Pixel[][], direction: number) {
    const [yOffset, xOffset] = this.offsets[direction];
    const x = this.x + xOffset;
    const y = this.y + yOffset;
    if (y < 0 || y >= board.length || x < 0 || x >= board[y].length) {
      return null;
    }
    return board[y][x];
  }

  getNeighbors(board: Pixel[][]) {
    return this.offsets.map((_, i) => this.getNeighbor(board, i));
  }

  toString() {
    if (this.color === Colors.Empty) {
      return "-";
    }
    const neighbors = this.getNeighbors(board);
    const matchingNeighbors = neighbors.filter(
      (n) => n && n.color === this.color
    );
    const otherColors = neighbors.filter(
      (n) =>
        n &&
        n.color !== this.color &&
        n.color !== Colors.White &&
        n.color !== Colors.Empty
    );
    const suffix = `${
      otherColors.length > 0 && this.color !== Colors.White ? "\x1b[4m" : ""
    }${matchingNeighbors.length}${rC}`;
    const escape = mosaics.some((m) => m.includes(this))
      ? colorTC(this.color, true) + tC(0, 0, 0, false)
      : colorTC(this.color, false);
    return `${escape}${suffix}`;
  }
}

const colorTC = (color: number, bg: boolean) => {
  switch (color) {
    case Colors.White:
      return tC(255, 255, 255, bg);
    case Colors.Yellow:
      return tC(255, 196, 0, bg);
    case Colors.Green:
      return tC(64, 255, 64, bg);
    case Colors.Purple:
      return tC(196, 128, 255, bg);
    default:
      return "";
  }
};

const tC = (r: number, g: number, b: number, bg: boolean) => {
  // truecolor
  return `\x1b[${bg ? 48 : 38};2;${r};${g};${b}m`;
};

const rC = "\x1b[0m"; // reset color

enum Colors {
  Empty = 0,
  White = 1,
  Yellow = 2,
  Green = 3,
  Purple = 4,
}

enum Directions {
  TopLeft = 0,
  TopRight = 1,
  Right = 2,
  BottomRight = 3,
  BottomLeft = 4,
  Left = 5,
}

let board: Pixel[][] = [];

const setupBoard = () => {
  board = [];
  for (let i = 0; i < 11; i++) {
    board.push([]);
    for (let j = 0; j < 6 + (i % 2); j++) {
      board[i].push(new Pixel(i, j));
    }
  }
  board[0] = [
    Colors.Green,
    Colors.Green,
    Colors.White,
    Colors.Yellow,
    Colors.Yellow,
    Colors.Empty,
  ].map((c, i) => new Pixel(0, i, c));
  board[1] = [
    Colors.Purple,
    Colors.Green,
    Colors.White,
    Colors.White,
    Colors.Yellow,
    Colors.Empty,
    Colors.Empty,
  ].map((c, i) => new Pixel(1, i, c));
  return board;
};

const printBoard = (board: Pixel[][]) => {
  let str = "";
  for (let i = board.length - 1; i > -1; i--) {
    str += " ".repeat((i + 1) % 2) + board[i].join(" ") + "\n";
  }
  console.log(str);
};

const checked: number[][] = [];
const mosaics: Pixel[][] = [];
const checkForMosaics = (board: Pixel[][]) => {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (checked.some((c) => c[0] === i && c[1] === j)) continue;
      checked.push([i, j]);
      if (
        board[i][j].color === Colors.Empty ||
        board[i][j].color === Colors.White
      ) {
        continue;
      }
      const neighbors = board[i][j].getNeighbors(board);
      const otherColors = neighbors.filter(
        (n) =>
          n &&
          n.color !== board[i][j].color &&
          n.color !== Colors.White &&
          n.color !== Colors.Empty
      );
      if (otherColors.length > 0) {
        continue;
      }
      const matchingNeighbors: Pixel[] = neighbors.filter(
        (n): n is Pixel => n !== null && n.color === board[i][j].color
      );
      if (matchingNeighbors.length !== 2) {
        continue;
      }
      const n1 = matchingNeighbors[0];
      const n2 = matchingNeighbors[1];
      if (!same(n1, n2)) continue;
      if (!same(n2, n1)) continue;
      matchingNeighbors.forEach((n) => {
        checked.push([n.y, n.x]);
      });
      mosaics.push([board[i][j], n1, n2]);
    }
  }
};

const same = (n1: Pixel, n2: Pixel): boolean => {
  const n1Neighbors = n1.getNeighbors(board);
  const n1Diff = otherColor(n1, n1Neighbors);
  if (n1Diff.length > 0) {
    return false;
  }
  const n1Same = sameColor(n1, n1Neighbors);
  if (n1Same.length !== 2) return false;
  if (!n1Same.some((n) => n === n2)) return false;
  return true;
};

const sameColor = (pixel: Pixel, neighbors: (null | Pixel)[]) => {
  return neighbors.filter((n) => n && n.color === pixel.color);
};

const sameColorNeighbors = (pixel: Pixel, board: Pixel[][]) => {
  const neighbors = pixel.getNeighbors(board);
  return sameColor(pixel, neighbors);
};

const otherColor = (pixel: Pixel, neighbors: (null | Pixel)[]) => {
  return neighbors.filter(
    (n) =>
      n &&
      n.color !== pixel.color &&
      n.color !== Colors.White &&
      n.color !== Colors.Empty
  );
};

const otherColorsNeighbors = (pixel: Pixel, board: Pixel[][]) => {
  const neighbors = pixel.getNeighbors(board);
  return sameColor(pixel, neighbors);
};

setupBoard();
checkForMosaics(board);
printBoard(board);
mosaics.forEach((m) => {
  console.log(
    colorTC(m[0].color, false) + m.map((p) => `${p.y},${p.x}`).join(" ")
  );
});
