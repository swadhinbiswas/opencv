/**
 * Chrome-free layout for the print/PDF routes. No AppShell, no nav — just the
 * document, so `window.print()` produces a clean PDF with nothing else.
 */
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
