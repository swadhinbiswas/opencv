"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Mail,
  Search,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const actions = [
  { href: "/dashboard", label: "Go to Dashboard", icon: LayoutDashboard, group: "Navigate" },
  { href: "/profile", label: "Edit Master Profile", icon: UserRound, group: "Navigate" },
  { href: "/templates", label: "Browse templates", icon: Sparkles, group: "Navigate" },
  { group: "Create", label: "New CV", href: "/cv/new", icon: FileText },
  { group: "Create", label: "New cover letter", href: "/cover-letters/new", icon: Mail },
  { group: "Create", label: "New job application", href: "/jobs", icon: FolderKanban },
  { group: "Create", label: "New note", href: "/jobs", icon: Briefcase },
];

export function CommandPalette({ triggerKey = "k" }: { triggerKey?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "Escape") return setOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === triggerKey) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [triggerKey]);

  const run = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  const groups = ["Navigate", "Create"];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, run an action…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {groups.map((g) => (
          <CommandGroup key={g} heading={g}>
            {actions
              .filter((a) => a.group === g)
              .map((a) => {
                const Icon = a.icon;
                return (
                  <CommandItem key={a.label} value={a.label} onSelect={() => run(a.href)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {a.label}
                  </CommandItem>
                );
              })}
          </CommandGroup>
        ))}
        <CommandSeparator />
      </CommandList>
    </CommandDialog>
  );
}

export function PaletteButton() {
  return (
    <button
      onClick={() => {
        const evt = new KeyboardEvent("keydown", { key: "k", metaKey: true });
        document.dispatchEvent(evt);
      }}
      className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search &amp; actions</span>
      <kbd className="ml-1 hidden rounded bg-background px-1.5 py-0.5 font-mono text-[10px] sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}