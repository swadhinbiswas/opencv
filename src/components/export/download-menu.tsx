"use client";

import { Download, FileText, FileType2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DownloadMenu({
  scope,
  id,
  label = "Download",
  variants,
  loading,
}: {
  scope: "cv" | "letter" | "bundle";
  id: string;
  label?: string;
  variants?: ("pdf" | "docx" | "txt")[];
  loading?: boolean;
}) {
  const kinds = variants ?? (scope === "cv" ? ["pdf", "docx", "txt"] : ["pdf"]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={loading}>
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Download as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {kinds.includes("pdf") && (
          <DropdownMenuItem asChild>
            <a href={`/api/export?kind=pdf&scope=${scope}&id=${id}`}>
              <FileText className="mr-2 h-4 w-4" /> PDF (for printing)
            </a>
          </DropdownMenuItem>
        )}
        {kinds.includes("docx") && (
          <DropdownMenuItem asChild>
            <a href={`/api/export?kind=docx&scope=${scope}&id=${id}`}>
              <FileType2 className="mr-2 h-4 w-4" /> Word (.docx)
            </a>
          </DropdownMenuItem>
        )}
        {kinds.includes("txt") && (
          <DropdownMenuItem asChild>
            <a href={`/api/export?kind=txt&scope=${scope}&id=${id}`}>
              <FileText className="mr-2 h-4 w-4" /> Plain text (.txt)
            </a>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
