import { Colors } from "./pixel";

export const pixelTrueColor = (color: number, bg: boolean) => {
  switch (color) {
    case Colors.White:
      return trueColor(255, 255, 255, bg);
    case Colors.Yellow:
      return trueColor(255, 196, 0, bg);
    case Colors.Green:
      return trueColor(64, 255, 64, bg);
    case Colors.Purple:
      return trueColor(196, 128, 255, bg);
    default:
      return "";
  }
};
export const trueColor = (r: number, g: number, b: number, bg: boolean) => {
  // truecolor
  return `\x1b[${bg ? 48 : 38};2;${r};${g};${b}m`;
};

export const resetCode = "\x1b[0m"; // reset code
