/*sample data only to test out frontend, 
will be removed when data from backend is retrieved*/

export const NAMES = [
  "VishalMaurya",
  "Jyotipriya",
  "PalakshGoyal",
  "ParthSangale",
  "RamcharanK",
  "SmitSig",
  "KrrishDhiman",
  "KeshavBaheti",
  "AthenaSeg",
  "ShubKrishan",
  "ShrehanRaj",
  "HimeshK",
  "HarshLamba",
  "SawSharda",
  "Magnetar",
  "Neon_Phantom",
  "PixelPiper",
  "QuantumByte",
  "SkyForge",
  "VoidWalker",
];


export interface GameDef {
  id: string;
  name: string;
  tag: string;
  type: "points" | "time";
  unit: string;
}

export const GAMES: GameDef[] = [
  {
    id: "space-runner",
    name: "Space Runner",
    tag: "endless runner",
    type: "points",
    unit: "pts",
  },
  {
    id: "sand-tetris",
    name: "Sand Tetris",
    tag: "simulation 2d",
    type: "points",
    unit: "pts",
  },
  {
    id: "possessed",
    name: "Possessed",
    tag: "horror / co-op",
    type: "time",
    unit: "",
  },
  {
    id: "cookie-runner",
    name: "Cookie Runner",
    tag: "endless runner",
    type: "points",
    unit: "coins",
  },
  {
    id: "arma-dodge",
    name: "Arma-Dodge",
    tag: "platformer",
    type: "points",
    unit: "pts",
  },
  {
    id: "zero-day",
    name: "Zero Day Protocol",
    tag: "tactical fps",
    type: "points",
    unit: "kills",
  },
];
