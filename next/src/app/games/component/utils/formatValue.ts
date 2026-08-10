// Combines the numeric score and the string unit/display sent by the game.
export function formatValue(score: number, scoreStr?: string) {
  if (scoreStr) {
    return `${score} ${scoreStr}`.trim();
  }
  return score.toLocaleString();
}