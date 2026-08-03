"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Opens a clean, chrome-free print view in a new tab which triggers the PDF dialog. */
export function DownloadPdfButton({
  href,
  label = "Download PDF",
}: {
  href: string;
  label?: string;
}) {
  return (
    <Button size="sm" onClick={() => window.open(href, "_blank", "noopener")}>
      <Download className="mr-1.5 h-4 w-4" /> {label}
    </Button>
  );
}