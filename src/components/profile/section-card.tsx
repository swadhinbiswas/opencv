"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SectionCard({
  id,
  title,
  subtitle,
  children,
  onRemove,
  onMove,
  disable = false,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onRemove?: () => void;
  onMove?: (dir: -1 | 1) => void;
  disable?: boolean;
}) {
  return (
    <Card className="border-border shadow-sm">
      <Accordion type="single" collapsible>
        <AccordionItem value={id} className="border-b-0">
          <div className="flex items-center gap-2 pr-3">
            <AccordionTrigger className="flex-1 px-4 py-3 text-sm font-medium hover:no-underline">
              <span className="truncate">{title || "Untitled"}</span>
              {subtitle && <span className="ml-2 shrink-0 truncate text-xs text-muted-foreground">{subtitle}</span>}
            </AccordionTrigger>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {onMove && (
                <>
                  <Button variant="ghost" size="icon" title="Move up" disabled={disable} onClick={() => onMove(-1)}>
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" title="Move down" disabled={disable} onClick={() => onMove(1)}>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </>
              )}
              {onRemove && (
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" title="Remove" onClick={onRemove}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <AccordionContent className="px-4 pb-4">
            <div className="space-y-3 pt-1">{children}</div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}

export function AddItemButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" className="w-full border-dashed" onClick={onClick}>
      <Plus className="mr-1.5 h-4 w-4" /> {label}
    </Button>
  );
}