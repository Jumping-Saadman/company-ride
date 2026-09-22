export function generateNextRequestId(existingIds: string[]): string {
  const year = new Date().getFullYear();
  const max = existingIds.reduce((acc, id) => {
    const match = id.match(/TR-\d{4}-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[1]));
  }, 0);
  return `TR-${year}-${String(max + 1).padStart(4, "0")}`;
}
