import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  FolderKanban,
  Mail,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/dashboard/service";
import { SampleDataButton } from "@/components/onboarding/sample-data-button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };

const STAGE_LABELS: Record<string, string> = {
  wishlist: "Wishlist",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  const stats = await getDashboardStats(session.userId);
  const doneCount = stats.checklist.filter((c) => c.done).length;
  const allDone = doneCount === stats.checklist.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-muted-foreground">
            {allDone
              ? "Your career command center is fully set up — keep building."
              : `${doneCount} of ${stats.checklist.length} setup steps complete.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SampleDataButton />
          <Button asChild>
            <Link href="/cv/new">
              <Plus className="mr-1.5 h-4 w-4" /> New CV
            </Link>
          </Button>
        </div>
      </header>

      {/* Stats */}
      <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          href="/cv"
          icon={FileText}
          label="CVs"
          value={stats.counts.cvs}
          hint="templates, tailored per job"
        />
        <StatCard
          href="/cover-letters"
          icon={Mail}
          label="Cover letters"
          value={stats.counts.letters}
          hint="paired to your CVs"
        />
        <StatCard
          href="/jobs"
          icon={FolderKanban}
          label="Applications"
          value={stats.counts.jobs}
          hint="tracked from wishlist → offer"
        />
        <StatCard
          href="/profile"
          icon={Sparkles}
          label="Profile sections"
          value={`${stats.counts.profileSections}/11`}
          hint="your master profile"
        />
      </section>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Pipeline */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" /> Application pipeline
            </CardTitle>
            <CardDescription>How many jobs sit at each stage.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.pipeline.every((p) => p.count === 0) ? (
              <p className="text-sm text-muted-foreground">
                No applications yet —{" "}
                <Link href="/jobs/new" className="underline">
                  add one
                </Link>{" "}
                to see your pipeline.
              </p>
            ) : (
              <ul className="space-y-2">
                {stats.pipeline.map((p) => (
                  <li key={p.stage}>
                    <div className="flex items-center justify-between text-sm">
                      <span>{STAGE_LABELS[p.stage] ?? p.stage}</span>
                      <span className="font-medium">{p.count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${Math.min(100, (p.count / Math.max(1, stats.counts.jobs)) * 100)}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent CVs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent CVs</CardTitle>
            <CardDescription>Jump back into your latest documents.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentCvs.length === 0 ? (
              <EmptyPrompt
                title="No CVs yet"
                body="Pick a template and create your first tailored CV — it takes minutes."
                cta={<Button asChild size="sm"><Link href="/cv/new">Create a CV</Link></Button>}
              />
            ) : (
              <ul className="divide-y divide-border">
                {stats.recentCvs.map((cv) => (
                  <li key={cv.id} className="flex items-center gap-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <Link href={`/cv/${cv.id}`} className="min-w-0 flex-1 font-medium hover:underline">
                      {cv.name}
                    </Link>
                    <span className="hidden text-xs text-muted-foreground sm:block">{cv.templateName}</span>
                    <StatusPill status={cv.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Checklist */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Get set up</CardTitle>
            <CardDescription>Four steps to a complete job-search toolkit.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {stats.checklist.map((step) => (
                <li key={step.key}>
                  <Link
                    href={step.href}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm transition hover:bg-muted/60"
                  >
                    {step.done ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <span className="h-4 w-4 shrink-0 rounded-full border-2 border-muted-foreground/40" />
                    )}
                    <span className={cn("flex-1", step.done && "text-muted-foreground line-through")}>
                      {step.label}
                    </span>
                    {step.done ? (
                      <span className="text-xs text-muted-foreground">Done</span>
                    ) : (
                      <span className="text-xs font-medium text-primary">Start →</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Recent letters */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Recent cover letters</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentLetters.length === 0 ? (
              <EmptyPrompt
                title="No letters yet"
                body="Pair a cover letter with a CV to send the full package."
                cta={<Button asChild size="sm"><Link href="/cover-letters">New letter</Link></Button>}
              />
            ) : (
              <ul className="space-y-2">
                {stats.recentLetters.map((l) => (
                  <li key={l.id}>
                    <Link href={`/cover-letters/${l.id}`} className="block rounded-md px-2 py-2 text-sm hover:bg-muted/60">
                      <span className="font-medium">{l.name}</span>
                      {l.jobRole ? (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {l.jobRole} · {l.jobCompany}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  hint,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="transition group-hover:border-primary/40">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-2xl font-bold leading-none">{value}</div>
            <div className="mt-1 truncate text-xs text-muted-foreground">
              {label} · {hint}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
        status === "ready"
          ? "bg-emerald-100 text-emerald-700"
          : status === "archived"
            ? "bg-muted text-muted-foreground"
            : "bg-amber-100 text-amber-700",
      )}
    >
      {status}
    </span>
  );
}

function EmptyPrompt({ title, body, cta }: { title: string; body: string; cta: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-xs text-xs text-muted-foreground">{body}</p>
      {cta}
    </div>
  );
}
