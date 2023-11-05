import { Pixel, Colors } from "./pixel";
import { pixelTrueColor } from "./util";
import { Board } from "./board";
import { basename } from "path";

interface Branch {
  score: number;
  moves: PixelData[];
}

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

interface PixelData {
  color: number;
  x: number;
  y: number;
}

const getHighestScore = (
  board: Board,
  depth: number,
  history: PixelData[],
  transpositionTable: Map<string, Branch>
): Branch => {
  const boardKey = board.hash(); // Generate a unique key for the current board state

  // Check if the board state is already in the transposition table
  if (transpositionTable.has(boardKey)) {
    // console.log("Found in transposition table");
    return transpositionTable.get(boardKey) as Branch;
  }

  if (depth == 0) {
    // board.printBoard();
    // console.log("Total:", board.getScore());
    return { score: board.getScore(), moves: history };
  }
  const moves = board.getMoves();
  let maxScore: Branch = { score: -Infinity, moves: [] };
  moves.forEach((move) => {
    for (const color of [
      Colors.White,
      Colors.Yellow,
      Colors.Green,
      Colors.Purple,
    ]) {
      // const copy = board.copy();
      // copy.pixels[move.y][move.x].color = color;
      board.pixels[move.y][move.x].color = color;
      // const historyCopy = [];
      // history.forEach((h) =>
      //   historyCopy.push({ color: h.color, x: h.x, y: h.y })
      // );
      // historyCopy.push({ color, x: move.x, y: move.y });
      history.push({ color, x: move.x, y: move.y });
      const b = getHighestScore(board, depth - 1, history, transpositionTable);
      board.pixels[move.y][move.x].color = Colors.Empty;
      history.pop();
      if (b.score > maxScore.score) {
        maxScore = b;
      }
      // console.log(b);
    }
  });
  transpositionTable.set(boardKey, maxScore);
  return maxScore;
};

const start = Date.now();
const top = getHighestScore(board, 4, [], new Map());
console.log("Top", top.score);
const newBoard = board.copy();
top.moves.forEach((m) => {
  6;
  console.log(`${m.y},${m.x} ${m.color}`);
  newBoard.pixels[m.y][m.x].color = m.color;
});
newBoard.printBoard();
const end = Date.now();
console.log("Time:", end - start);
