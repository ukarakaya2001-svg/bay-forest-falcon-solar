import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { PlaygroundView } from "@/components/playground-view";
import { EXAMPLES, type TargetId } from "@/lib/aether";

type Search = {
  ex?: string;
  src?: string;
  lang?: string;
};

export const Route = createFileRoute("/playground")({
  component: PlaygroundPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    ex: typeof s.ex === "string" ? s.ex : undefined,
    src: typeof s.src === "string" ? s.src : undefined,
    lang: typeof s.lang === "string" ? s.lang : undefined,
  }),
});

function PlaygroundPage() {
  const { ex, src, lang } = Route.useSearch();
  let initialSource: string | undefined;
  if (src) {
    try {
      initialSource = decodeURIComponent(atob(src));
    } catch {
      initialSource = undefined;
    }
  } else if (ex) {
    initialSource = EXAMPLES.find((e) => e.id === ex)?.code;
  }
  const initialTarget = lang as TargetId | undefined;
  return (
    <AppShell dense>
      <PlaygroundView initialSource={initialSource} initialTarget={initialTarget} />
    </AppShell>
  );
}
