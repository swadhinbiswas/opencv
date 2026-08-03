"use client";

import { useEffect, useRef, useState } from "react";
import { LetterDocument } from "@/components/cover-letters/letter-document";
import type { LetterStyle } from "@/lib/cover-letters/styles";
import { cn } from "@/lib/utils";

const DESIGN_W = 600;
const DESIGN_H = Math.round((600 * 297) / 210); // A4 aspect

const SAMPLE_CONTENT = {
  greeting: "Dear Hiring Team,",
  paragraphs: [
    "I am excited to apply for the Senior Product Engineer role at Nova Labs. With 8+ years shipping scalable products, I bring a track record of leading teams and driving measurable growth.",
    "At Bright Systems I helped ship features adopted by 2M+ monthly users while improving platform reliability. I would love to bring that same focus to your team.",
  ],
  closing: "Thank you for your time and consideration.",
  signOff: "Best regards,",
};

const SAMPLE_FROM = "Alex Rivera\nBerlin, Germany\nalex.rivera@email.com\n+1 555 014 2388";

/**
 * A real, miniature render of a cover letter template — the actual
 * LetterDocument scaled to fit its container exactly.
 */
export function LetterThumbnail({
  style,
  accent,
  font,
  scale = 0.5,
  className,
}: {
  style: LetterStyle;
  accent: string;
  font: string;
  scale?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [fit, setFit] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setFit(Math.min(w / DESIGN_W, h / DESIGN_H));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const final = fit ?? scale;
  const boxW = Math.round(DESIGN_W * final);
  const boxH = Math.round(DESIGN_H * final);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none relative aspect-[210/297] w-full select-none overflow-hidden rounded-sm bg-white",
        className,
      )}
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div style={{ width: boxW, height: boxH, overflow: "hidden" }}>
          <div
            style={{
              width: DESIGN_W,
              height: DESIGN_H,
              transform: `scale(${final})`,
              transformOrigin: "top left",
              background: "#fff",
            }}
          >
            <LetterDocument
              from={SAMPLE_FROM}
              date="August 3, 2026"
              content={SAMPLE_CONTENT}
              role="Senior Product Engineer"
              company="Nova Labs"
              style={style}
              accent={accent}
              font={font}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
