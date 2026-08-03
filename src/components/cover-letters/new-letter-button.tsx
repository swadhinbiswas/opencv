"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NewLetterButton({
  jobId,
  cvId,
}: {
  jobId?: string;
  cvId?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    const res = await fetch("/api/cover-letters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Untitled letter",
        ...(jobId ? { jobId } : {}),
        ...(cvId ? { cvId } : {}),
      }),
    });
    const b = await res.json();
    setBusy(false);
    if (b.ok) router.push(`/cover-letters/${b.data.id}/edit`);
  }

  return (
    <Button onClick={create} disabled={busy}>
      {busy ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Mail className="mr-1.5 h-4 w-4" />}
      New letter
    </Button>
  );
}