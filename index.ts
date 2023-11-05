import { Pixel, Colors } from "./pixel";
import { pixelTrueColor } from "./util";
import { Board } from "./board";

let board = new Board();

board.setupBoard();
board.getMosiacs();
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

console.log(board.getMoves().map((p) => `${p.y},${p.x}`));
