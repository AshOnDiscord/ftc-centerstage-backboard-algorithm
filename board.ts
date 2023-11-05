import { Pixel, Colors, Directions } from "./pixel";
import { resetCode } from "./util";

export class Board {
  constructor(public pixels: Pixel[][] = [], public mosaics: Pixel[][] = []) {
    this.setupBoard();
  }

  public setupBoard = () => {
    this.pixels = [];
    this.mosaics = [];
    for (let i = 0; i < 11; i++) {
      this.pixels.push([]);
      for (let j = 0; j < 6 + (i % 2); j++) {
        this.pixels[i].push(new Pixel(i, j, this));
      }
    }
    this.pixels[0] = [
      Colors.Yellow,
      Colors.White,
      Colors.White,
      Colors.Yellow,
      Colors.Yellow,
      Colors.Empty,
    ].map((c, i) => new Pixel(0, i, this, c));
    this.pixels[1] = [
      Colors.Purple,
      Colors.Green,
      Colors.White,
      Colors.White,
      Colors.Yellow,
      Colors.Empty,
      Colors.Empty,
    ].map((c, i) => new Pixel(1, i, this, c));
    this.pixels[2] = [
      Colors.Empty,
      Colors.White,
      Colors.Empty,
      Colors.White,
      Colors.Empty,
      Colors.Empty,
    ].map((c, i) => new Pixel(2, i, this, c));
    return this;
  };

  public printBoard() {
    let str = "";
    for (let i = this.pixels.length - 1; i > -1; i--) {
      str += " ".repeat((i + 1) % 2) + this.pixels[i].join(" ") + "\n";
    }
    console.log(str);
  }

  public getMosiacs() {
    this.mosaics = [];
    const visited: boolean[][] = this.pixels.map((row) => row.map(() => false));
    for (let i = 0; i < this.pixels.length; i++) {
      for (let j = 0; j < this.pixels[i].length; j++) {
        const pixel = this.pixels[i][j];
        if (pixel.color === Colors.Empty || pixel.color === Colors.White) {
          continue;
        }
        if (visited[i][j]) continue;
        visited[i][j] = true;
        const neighbors = pixel.getNeighbors();
        const otherColors = neighbors.filter((n): n is Pixel =>
          n
            ? n.color !== pixel.color &&
              n.color !== Colors.White &&
              n.color !== Colors.Empty
            : false
        );
        if (otherColors.length !== 2 && otherColors.length !== 0) {
          continue;
        }
        const sameColor = neighbors.filter((n): n is Pixel =>
          n ? n.color === pixel.color : false
        );
        const multiColor = otherColors.length === 2;
        if (multiColor && sameColor.length !== 0) continue;

        const matchingNeighbors: Pixel[] = multiColor ? otherColors : sameColor;
        if (matchingNeighbors.length !== 2) {
          continue;
        }
        const n1 = matchingNeighbors[0];
        const n2 = matchingNeighbors[1];
        if (!this.match(n1, n2, multiColor)) continue;
        if (!this.match(n2, n1, multiColor)) continue;
        visited[n1.y][n1.x] = true;
        visited[n2.y][n2.x] = true;
        this.mosaics.push([pixel, n1, n2]);
      }
    }
  }

  public getLines() {
    let lines = 0;
    for (let i = 2; i < this.pixels.length; i += 3) {
      if (this.pixels[i].filter((p) => p.color !== Colors.Empty).length === 0)
        break; // since its bottom up, we can early exit if we have a empty row
      lines++;
    }
    return lines;
  }

  public getScore() {
    let score = 0;
    for (let i = 0; i < this.pixels.length; i++) {
      for (let j = 0; j < this.pixels[i].length; j++) {
        const p = this.pixels[i][j];
        if (p.color !== Colors.Empty) score += 3;
      }
    }
    this.getMosiacs();
    score += this.mosaics.length * 10;
    score += this.getLines() * 10;
    return score;
  }

  public getMoves() {
    // go from top to bottom for each column
    const moves: Pixel[] = [];
    for (let i = 0; i < this.pixels.length; i++) {
      for (let j = 0; j < this.pixels[i].length; j++) {
        const point = this.pixels[i][j];
        if (point.color !== Colors.Empty) continue; // skip if not empty
        // check bottomleft and bottomright (support for the pixel so doesn't fall)
        // if side pixel then we only need one of them(br for leftside, bl for rightside)
        const bl = point.getNeighbor(Directions.BottomLeft);
        const br = point.getNeighbor(Directions.BottomRight);
        if ((!bl && br?.color === Colors.Empty) || bl?.color === Colors.Empty)
          continue;
        if ((!br && bl?.color === Colors.Empty) || br?.color === Colors.Empty)
          continue;
        moves.push(point);
      }
    }
    return moves;
  }

  private match(n1: Pixel, n2: Pixel, multiColor: boolean): boolean {
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
    if (!n1Same.includes(n2)) return false;
    return true;
  }

  public copy() {
    const copy = new Board();
    copy.pixels = this.pixels.map((row) =>
      row.map((p) => new Pixel(p.y, p.x, copy, p.color))
    );
    copy.getMosiacs();
    return copy;
  }

  public hash(): string {
    // Preallocate the key for better performance
    const keyArray: number[] = new Array(
      this.pixels.length * this.pixels[0].length
    );

    let index = 0;
    for (let i = 0; i < this.pixels.length; i++) {
      for (let j = 0; j < this.pixels[i].length; j++) {
        keyArray[index] = this.pixels[i][j].color;
        index++;
      }
    }

    return keyArray.join("");
  }
}
