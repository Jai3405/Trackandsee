export function serverWins(pendingClientUpdatedAt: string | undefined, remoteUpdatedAt: string): boolean {
  if (!pendingClientUpdatedAt) return true;
  return remoteUpdatedAt > pendingClientUpdatedAt;
}
