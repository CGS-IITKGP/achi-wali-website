export function formatValue(value: number,type: "points" | "time") {
  if (type === "time") {
    const mins = Math.floor(value / 60);
    const secs = value % 60;

    return `${mins}m ${secs}s`;
  }

  return value.toLocaleString();
}