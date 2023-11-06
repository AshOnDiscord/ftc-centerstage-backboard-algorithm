import { Colors, PixelData } from "./pixel";
import { Board } from "./board";

interface Branch {
  score: number;
  moves: PixelData[];
}

let board = new Board();

board.setupBoard();
board.printBoard();

console.log();
console.log("Total:", board.getScore());

const getHighestScore = (
  board: Board,
  depth: number,
  history: PixelData[],
  transpositionTable: Map<string, Branch>
): Branch => {
  const boardKey = board.hash();

  if (transpositionTable.has(boardKey)) {
    return transpositionTable.get(boardKey) as Branch;
  }

  if (depth == 0) {
    const score = board.getScore();
    if (score.color.length !== 0) {
      for (const c of score.color) {
        // console.log(`${c.y},${c.x} ${c.color}`);
        const hC = history.find((h) => h.x === c.x && h.y === c.y);
        if (hC) {
          hC.color = c.color;
        }
      }
    }
    return {
      score: score.score,
      moves: [...history],
    };
  }
  const moves = board.getMoves();
  let maxScore: Branch = { score: -Infinity, moves: [] };
  moves.forEach((move) => {
    const colorSums: number[] = [0, 0, 0, 0, 0];
    for (let y = 0; y < board.pixels.length; y++) {
      for (let x = 0; x < board.pixels[y].length; x++) {
        colorSums[board.pixels[y][x].color]++;
      }
    }
    [Colors.White, Colors.Yellow, Colors.Green, Colors.Purple].map(
      (e) => colorSums[e] < board.limits[e]
    );
    for (let color = Colors.White; color < Colors.Purple; color++) {
      if (colorSums[color] >= board.limits[color]) continue;
      board.pixels[move.y][move.x].color = color;
      history.push({ color, x: move.x, y: move.y });
      const b = getHighestScore(board, depth - 1, history, transpositionTable);
      history.pop();
      if (b.score > maxScore.score) {
        maxScore = b;
      }
      if (color == Colors.Yellow) {
        // board.printBoard();
        break;
      }
      board.pixels[move.y][move.x].color = Colors.Empty;
    }
  });
  transpositionTable.set(boardKey, maxScore);
  return maxScore;
};

const start = Date.now();
const top = getHighestScore(board, 6, [], new Map());
const end = Date.now();
const newBoard = board.copy();
top.moves.forEach((m) => {
  6;
  console.log(`${m.y},${m.x} ${m.color}`);
  newBoard.pixels[m.y][m.x].color = m.color;
});

newBoard.printBoard();
console.log("Top", top.score);
console.log("Time:", end - start);
