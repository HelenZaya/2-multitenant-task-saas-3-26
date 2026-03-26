export function getNewPosition(prev?: number | null, next?: number | null) {
  if (prev == null && next == null) return 1024;
  if (prev == null) return (next ?? 1024) / 2;
  if (next == null) return prev + 1024;
  return (prev + next) / 2;
}
