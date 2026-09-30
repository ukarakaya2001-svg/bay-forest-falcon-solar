import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { AetherMark } from "@/components/aether-mark";
import { hydrateLocale, useCopy, useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function AppShell({ children, dense = false }: { children: ReactNode; dense?: boolean }) {
  const t = useCopy();
  const locale = useLocale((s) => s.locale);
  const setLocale = useLocale((s) => s.setLocale);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    hydrateLocale();
  }, []);

  const nav = [
    { to: "/", label: t.name, match: "/" },
    { to: "/playground", label: t.playground, match: "/playground" },
    { to: "/learn", label: t.learn, match: "/learn" },
  ] as const;

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-fg">
            <AetherMark className="size-6" />
            <span className="font-display text-lg italic tracking-tight">Aether</span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            {nav.slice(1).map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center px-2.5 text-sm sm:px-3",
                  path === item.match ? "text-fg" : "text-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            ))}
            <div className="ml-1 flex h-9 items-center rounded-sm border border-border p-0.5">
              {(["tr", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLocale(l)}
                  className={cn(
                    "h-8 min-w-9 px-2 text-xs uppercase tracking-wide",
                    locale === l ? "bg-elevated text-fg" : "text-muted hover:text-fg",
                  )}
                  aria-pressed={locale === l}
                >
                  {l}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <div className={cn("flex flex-1 flex-col", dense ? "min-h-0 overflow-hidden" : "")}>{children}</div>
    </div>
  );
}
