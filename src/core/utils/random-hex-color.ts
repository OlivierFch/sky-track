import { HexColor } from "../types";

/**
 * Generates a random hexadecimal color string (e.g. "#3af1c9").
 * @returns A string starting with "#" followed by 6 hexadecimal digits.
 */
function randomHexColor(): HexColor {
  const randomInt = Math.floor(Math.random() * 0xffffff); // Range: 0 → 16777215
  const hex = randomInt.toString(16).padStart(6, "0");
  return `#${hex}`;
}

export { randomHexColor };
