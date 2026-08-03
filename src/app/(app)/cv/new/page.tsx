import type { Metadata } from "next";
import { TemplatePicker } from "@/components/cv/template-picker";

export const metadata: Metadata = { title: "New CV" };

export default function NewCvPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Create a new CV</h1>
        <p className="mt-1 text-muted-foreground">
          Pick a template. Your Master Profile is snapshotted into it automatically.
        </p>
      </header>
      <div className="mt-8">
        <TemplatePicker />
      </div>
    </div>
  );
}