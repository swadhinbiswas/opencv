"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  UserRound,
} from "lucide-react";
import { GithubIcon } from "./github-icon";
import { toast } from "sonner";
import { useSession } from "@/store/session";
import { ThemeToggle } from "./theme-toggle";
import { CommandPalette, PaletteButton } from "./command-palette";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", label: "Master Profile", icon: UserRound },
  { href: "/cv", label: "CVs", icon: FileText },
  { href: "/cover-letters", label: "Cover letters", icon: Mail },
  { href: "/jobs", label: "Job tracker", icon: Briefcase },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    router.push("/login");
  };

  const initials = (user?.name || user?.email || "U")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen w-full">
      <CommandPalette />
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-sidebar md:flex">
        <Link href="/dashboard" className="flex h-14 items-center gap-2 border-b border-sidebar-border px-5">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
            OC
          </span>
          <span className="font-semibold tracking-tight">OpenCV</span>
        </Link>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-2">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background px-4">
          <PaletteButton />
          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/swadhinbiswas"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="OpenCV on GitHub — made by Swadhin Biswas"
              title="Made by Swadhin Biswas"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <GithubIcon className="h-4 w-4" />
            </a>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs text-primary">
                      {initials || "OC"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="text-sm font-medium">{user?.name || user?.email}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/profile")}>
                  <UserRound className="mr-2 h-4 w-4" /> Master Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/settings")}>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-background">{children}</main>
      </div>
    </div>
  );
}