export const PLAYFUL_PALETTE = [
  { name: "teal", bg: "#5DCAA5", text: "#04342C" },
  { name: "amber", bg: "#EF9F27", text: "#412402" },
  { name: "purple", bg: "#7F77DD", text: "#26215C" },
  { name: "coral", bg: "#F0997B", text: "#4A1B0C" },
  { name: "pink", bg: "#D4537E", text: "#4B1528" },
  { name: "blue", bg: "#4FA9D1", text: "#042C53" },
] as const;

export function categoryColor(index: number) {
  return PLAYFUL_PALETTE[index % PLAYFUL_PALETTE.length];
}

export function productColor(index: number) {
  return PLAYFUL_PALETTE[index % PLAYFUL_PALETTE.length];
}

export function hashColor(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return PLAYFUL_PALETTE[Math.abs(hash) % PLAYFUL_PALETTE.length];
}

export const BANNER_PINK = "#D4537E";
