import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { listCvs } from "@/lib/cv/service";

export const metadata: Metadata = { title: "CVs" };

export default async function CvListPage() {
  const session = await getSession();
  const cvs = session ? await listCvs(session.userId) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">CVs</h1>
          <p className="mt-1 text-muted-foreground">
            Every tailored CV you create from your Master Profile.
          </p>
        </div>
        <Button asChild>
          <Link href="/cv/new">
            <Plus className="mr-1.5 h-4 w-4" /> New CV
          </Link>
        </Button>
      </header>

      {cvs.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 font-semibold">No CVs yet</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Pick a template and we’ll snapshot your Master Profile into a first
            draft you can tailor per job.
          </p>
          <Button asChild className="mt-5">
            <Link href="/cv/new">Create your first CV</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cvs.map((row) => (
            <Card key={row.cv.id} className="flex flex-col">
              <CardContent className="flex-1 pt-6">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="mt-4 font-semibold">{row.cv.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {row.templateName ?? "Custom template"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {row.visibleCount}/{row.sectionCount} sections ·{" "}
                  {row.cv.status}
                </p>
              </CardContent>
              <CardFooter className="flex gap-2 border-t pt-4">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link href={`/cv/${row.cv.id}/edit`}>Edit</Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="flex-1">
                  <Link href={`/cv/${row.cv.id}`}>Preview</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}