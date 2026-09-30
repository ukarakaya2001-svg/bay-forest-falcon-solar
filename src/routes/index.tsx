import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AetherMark } from "@/components/aether-mark";
import { AppShell } from "@/components/app-shell";
import { CodePane } from "@/components/code-pane";
import { Button } from "@/components/ui/button";
import { emit, highlightAether, highlightTarget, TARGETS, type TargetId } from "@/lib/aether";
import { useCopy } from "@/lib/locale";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

const DEMO = `fn greet(name: str) -> str {
  return "Hello, " + name
}

fn main() {
  print(greet("Ada"))
}
`;

const CYCLE: TargetId[] = ["python", "javascript", "go", "rust", "java", "ruby", "swift", "haskell"];

function Home() {
  const t = useCopy();
  const [idx, setIdx] = useState(0);
  const target = CYCLE[idx]!;
  const sourceHtml = useMemo(() => highlightAether(DEMO), []);
  const out = useMemo(() => emit(DEMO, target), [target]);
  const outHtml = useMemo(() => highlightTarget(out.ok ? out.code : "", target), [out, target]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => setIdx((i) => (i + 1) % CYCLE.length), 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <AppShell>
      <main className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        <section className="relative flex flex-col items-center pt-12 pb-14 text-center sm:pt-20 sm:pb-20">
          <AetherMark className="mb-6 size-12 text-accent sm:size-14" />
          <h1 className="font-display text-6xl leading-none tracking-[-0.03em] italic sm:text-8xl">Aether</h1>
          <p className="mt-5 max-w-xl font-display text-2xl leading-snug text-fg sm:text-3xl">{t.tagline}</p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{t.lead}</p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg">
              <Link to="/playground">
                {t.ctaPlay}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/learn">{t.ctaLearn}</Link>
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow-border)]">
          <div className="grid min-h-72 md:grid-cols-2">
            <div className="flex min-h-64 flex-col border-b border-border md:border-r md:border-b-0">
              <div className="flex h-10 items-center border-b border-border px-4 font-mono text-xs uppercase tracking-wider text-muted">
                Aether
              </div>
              <CodePane value={DEMO} html={sourceHtml} readOnly label="Aether" />
            </div>
            <div className="flex min-h-64 flex-col">
              <div className="flex h-10 items-center justify-between border-b border-border px-4">
                <span className="font-mono text-xs uppercase tracking-wider text-muted">
                  {TARGETS.find((x) => x.id === target)?.name}
                </span>
                <div className="flex gap-1">
                  {CYCLE.map((id, i) => (
                    <button
                      key={id}
                      type="button"
                      aria-label={id}
                      onClick={() => setIdx(i)}
                      className={cn("size-1.5 rounded-full", i === idx ? "bg-accent" : "bg-border-strong")}
                    />
                  ))}
                </div>
              </div>
              <CodePane value={out.ok ? out.code : ""} html={outHtml} readOnly label={target} />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <p className="mb-4 font-mono text-xs uppercase tracking-wider text-subtle">{t.target}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            {TARGETS.map((lang) => (
              <li key={lang.id} className="font-mono text-sm text-muted">
                {lang.name}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
          {[
            { k: t.principle1t, v: t.principle1, n: "01" },
            { k: t.principle2t, v: t.principle2, n: "02" },
            { k: t.principle3t, v: t.principle3, n: "03" },
          ].map((p) => (
            <article key={p.n} className="bg-surface px-5 py-6 sm:px-6 sm:py-8">
              <p className="font-mono text-xs text-subtle">{p.n}</p>
              <h2 className="mt-3 font-display text-2xl italic tracking-tight">{p.k}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{p.v}</p>
            </article>
          ))}
        </section>

        <footer className="mt-16 border-t border-border pt-8 text-sm text-subtle">{t.footer}</footer>
      </main>
    </AppShell>
  );
}
