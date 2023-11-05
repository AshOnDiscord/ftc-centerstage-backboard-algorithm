import { Pixel, Colors } from "./pixel";
import { pixelTrueColor } from "./util";
import { Board } from "./board";
import { get } from "http";

let board = new Board();

board.setupBoard();
board.printBoard();
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

console.log();
console.log("Total:", board.getScore());

const getHighestScore = (
  board: Board,
  moveHistory: Pixel[],
  depth: number
): { board: Board; moveHistory: Pixel[] } => {
  if (depth > 2) {
    // console.log(board.getScore());
    return { board, moveHistory };
  }
  // recursive move generation, minimax
  const moves = board.getMoves();
  const scores: { board: Board; moveHistory: Pixel[] }[] = [];
  moves.forEach((move) => {
    for (const color of [
      Colors.White,
      Colors.Yellow,
      Colors.Green,
      Colors.Purple,
    ]) {
      const copy = board.copy();
      copy.pixels[move.y][move.x].color = color;
      // const score = copy.getScore();
      // console.log(move.y, move.x, color, score);
      const historyCopy: Pixel[] = moveHistory.map((m) => m);
      historyCopy.push(new Pixel(move.y, move.x, copy, color));
      const b = getHighestScore(copy, historyCopy, depth + 1);
      scores.push(b);
      // console.log(b);
    }
  });
  return scores.sort((a, b) => {
    return b.board.getScore() - a.board.getScore();
  })[0];
};

const start = Date.now();
const top = getHighestScore(board, [], 0);
console.log(
  "Top",
  top.board.getScore(),
  top.moveHistory.map((m) => `${m.y},${m.x} ${Colors[m.color]}`).join(" | ")
);
const end = Date.now();
console.log("Time:", end - start);
top.board.printBoard();
