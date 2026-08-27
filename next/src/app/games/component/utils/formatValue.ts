// Combines the numeric score and the string unit/display sent by the game cleanly.
export function formatValue(score: number, scoreStr?: string) {
  if (!scoreStr || scoreStr.trim() === "") {
    return score.toLocaleString();
  }
  // If scoreStr already contains the numeric score (e.g. "824 pts" or "824"), return it directly
  if (scoreStr.includes(String(score)) || scoreStr.includes(score.toLocaleString())) {
    return scoreStr;
  }
  return `${score.toLocaleString()} ${scoreStr}`.trim();
}