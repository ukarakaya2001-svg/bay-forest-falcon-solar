import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CodePane } from "@/components/code-pane";
import { Button } from "@/components/ui/button";
import { highlightAether } from "@/lib/aether";
import { CHAPTERS } from "@/lib/learn";
import { useCopy, useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn")({ component: LearnPage });

function LearnPage() {
  const t = useCopy();
  const locale = useLocale((s) => s.locale);
  const [id, setId] = useState(CHAPTERS[0]!.id);
  const chapter = CHAPTERS.find((c) => c.id === id) ?? CHAPTERS[0]!;
  const html = useMemo(() => highlightAether(chapter.code), [chapter.code]);
  const idx = CHAPTERS.findIndex((c) => c.id === chapter.id);
  const next = CHAPTERS[idx + 1];

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row">
        <nav className="lg:w-56 lg:shrink-0">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-subtle">{t.learn}</p>
          <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {CHAPTERS.map((c, i) => (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setId(c.id)}
                  className={cn(
                    "flex h-11 items-center gap-3 rounded-sm px-3 text-left text-sm lg:w-full",
                    c.id === chapter.id ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <span className="font-mono text-xs text-subtle tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {c.title[locale]}
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0 flex-1">
          <p className="font-mono text-xs uppercase tracking-wider text-subtle">
            {t.chapter} {String(idx + 1).padStart(2, "0")}
          </p>
          <h1 className="mt-2 font-display text-4xl italic tracking-tight sm:text-5xl">{chapter.title[locale]}</h1>
          <div className="mt-6 max-w-prose space-y-4 text-base leading-relaxed text-muted">
            {chapter.body[locale].map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-8 h-72 overflow-hidden rounded-lg border border-border bg-surface sm:h-80">
            <CodePane value={chapter.code} html={html} readOnly label={chapter.title[locale]} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/playground" search={chapter.exampleId ? { ex: chapter.exampleId } : undefined}>
                {t.tryIt}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            {next ? (
              <Button variant="outline" onClick={() => setId(next.id)}>
                {t.next}: {next.title[locale]}
              </Button>
            ) : null}
          </div>
        </article>
      </main>
    </AppShell>
  );
}
