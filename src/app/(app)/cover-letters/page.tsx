import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { listLetters } from "@/lib/cover-letters/service";
import { NewLetterButton } from "@/components/cover-letters/new-letter-button";

export const metadata: Metadata = { title: "Cover letters" };

export default async function CoverLettersPage() {
  const session = await getSession();
  const letters = session ? await listLetters(session.userId) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Cover letters</h1>
          <p className="mt-1 text-muted-foreground">
            Written for a specific job, paired with a CV, and formatted to match.
          </p>
        </div>
        <NewLetterButton />
      </header>

      {letters.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <Mail className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No letters yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Start from a blank letter or link one to an open application — the
            recipient line fills in automatically.
          </p>
          <div className="mt-5">
            <NewLetterButton />
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {letters.map((l) => (
            <Card key={l.id} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-semibold">{l.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {l.jobRole ? `${l.jobRole} · ${l.jobCompany ?? ""}` : "General letter"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {l.cvName ? `Paired with ${l.cvName}` : "No CV paired"}
                  {l.templateName ? ` · ${l.templateName}` : ""}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-4">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/cover-letters/${l.id}/edit`}>Edit</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="flex-1">
                  <Link href={`/cover-letters/${l.id}`}>Preview</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}