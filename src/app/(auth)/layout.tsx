export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            OC
          </span>
          <span className="font-semibold tracking-tight">OpenCV</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}