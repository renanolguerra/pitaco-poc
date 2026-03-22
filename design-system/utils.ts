export function tokenKeyToCssVar(key: string): string {
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
}

export function sidebarKeyToCssVar(key: string): string {
  return `sidebar-${tokenKeyToCssVar(key)}`;
}
