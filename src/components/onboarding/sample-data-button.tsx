"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SampleDataButton({ className }: { className?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function load() {
    setBusy(true);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const body = await res.json();
      if (!body.ok) throw new Error(body.error ?? "Could not load sample data");
      toast.success("Sample data loaded — check out your new CV!");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button variant="outline" onClick={load} disabled={busy} className={className}>
      {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Wand2 className="mr-1.5 h-4 w-4" />}
      Try with sample data
    </Button>
  );
}
