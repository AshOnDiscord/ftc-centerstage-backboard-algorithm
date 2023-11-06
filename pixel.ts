import { Board } from "./board";
import { pixelTrueColor, trueColor, resetCode } from "./util";

export interface PixelData {
  color: number;
  x: number;
  y: number;
}

export class Pixel {
  private offsets: number[][];

  constructor(
    public y: number,
    public x: number,
    public board: Board,
    public color: number = 0
  ) {
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

  getNeighbor(direction: number) {
    const [yOffset, xOffset] = this.offsets[direction];
    const x = this.x + xOffset;
    const y = this.y + yOffset;
    if (
      y < 0 ||
      y >= this.board.pixels.length ||
      x < 0 ||
      x >= this.board.pixels[y].length
    ) {
      return null;
    }
    return this.board.pixels[y][x];
  }

  getNeighbors() {
    return this.offsets.map((_, i) => this.getNeighbor(i));
  }

  otherColorNeighbors(): Pixel[] {
    return this.getNeighbors().filter((n): n is Pixel =>
      n
        ? n.color !== this.color &&
          n.color !== Colors.White &&
          n.color !== Colors.Empty
        : false
    );
  }

  sameColorNeighbors(): Pixel[] {
    return this.getNeighbors().filter((n): n is Pixel =>
      n ? n.color === this.color : false
    );
  }

  toString() {
    if (this.board.getMoves().includes(this))
      return `${trueColor(255, 0, 255, false)}+${resetCode}`;
    if (this.color === Colors.Empty) {
      return "-";
    }
    const neighbors = this.getNeighbors();
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
    6;
    const suffix = `${
      this.board.mosaics.some((e) => e.includes(this)) ? "\x1b[4m" : ""
    }O${resetCode}`;
    const escape = pixelTrueColor(this.color, false);
    return `${escape}${suffix}`;
  }
}

export enum Colors {
  Empty = 0,
  White = 1,
  Yellow = 2,
  Green = 3,
  Purple = 4,
}

export enum Directions {
  TopLeft = 0,
  TopRight = 1,
  Right = 2,
  BottomRight = 3,
  BottomLeft = 4,
  Left = 5,
}
