import { Check, Copy, Play, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import { CodePane } from "@/components/code-pane";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_SOURCE,
  EXAMPLES,
  emit,
  highlightAether,
  highlightTarget,
  run,
  TARGETS,
  type TargetId,
} from "@/lib/aether";
import { useCopy, useLocale } from "@/lib/locale";
import { cn } from "@/lib/utils";

type ConsoleState = {
  output: string[];
  value: string | null;
  error: { message: string; line: number; col: number } | null;
};

const STORAGE_KEY = "aether-source";
const TARGET_KEY = "aether-target";

export function PlaygroundView({ initialSource, initialTarget }: { initialSource?: string; initialTarget?: TargetId }) {
  const t = useCopy();
  const locale = useLocale((s) => s.locale);
  const [source, setSource] = useState(initialSource ?? DEFAULT_SOURCE);
  const [target, setTarget] = useState<TargetId>(initialTarget ?? "python");
  const [pane, setPane] = useState<"source" | "emit" | "console">("source");
  const [copied, setCopied] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [consoleState, setConsoleState] = useState<ConsoleState>({ output: [], value: null, error: null });

  useEffect(() => {
    if (initialSource) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedT = localStorage.getItem(TARGET_KEY);
      if (saved) setSource(saved);
      if (savedT && TARGETS.some((x) => x.id === savedT)) setTarget(savedT as TargetId);
    } catch {
      /* ignore */
    }
  }, [initialSource]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, source);
      localStorage.setItem(TARGET_KEY, target);
    } catch {
      /* ignore */
    }
  }, [source, target]);

  const sourceHtml = useMemo(() => highlightAether(source), [source]);
  const emitted = useMemo(() => emit(source, target), [source, target]);
  const emitHtml = useMemo(
    () => highlightTarget(emitted.ok ? emitted.code : emitted.errors.map((e) => e.message).join("\n"), target),
    [emitted, target],
  );

  const onRun = useCallback(() => {
    const result = run(source);
    if (result.ok) {
      setConsoleState({ output: result.output, value: result.value, error: null });
    } else {
      setConsoleState({ output: result.output, value: null, error: result.error });
    }
    setPane("console");
  }, [source]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        onRun();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRun]);

  const copyOut = async () => {
    const text = emitted.ok ? emitted.code : "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  const loadExample = (id: string) => {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    setSource(ex.code);
    setExamplesOpen(false);
    setConsoleState({ output: [], value: null, error: null });
  };

  const consoleText = consoleState.error
    ? `${t.err} (${t.line} ${consoleState.error.line}:${consoleState.error.col})\n${consoleState.error.message}`
    : consoleState.output.length === 0 && !consoleState.value
      ? t.emptyConsole
      : [
          ...consoleState.output,
          consoleState.value ? `${t.result}: ${consoleState.value}` : "",
        ]
          .filter(Boolean)
          .join("\n");

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setExamplesOpen((v) => !v)}>
            {t.examples}
          </Button>
          {examplesOpen ? (
            <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-md border border-border bg-elevated p-1 shadow-[var(--shadow-border)]">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => loadExample(ex.id)}
                  className="flex w-full flex-col items-start rounded-xs px-3 py-2 text-left hover:bg-surface"
                >
                  <span className="text-sm text-fg">{ex.title[locale]}</span>
                  <span className="text-xs text-muted">{ex.blurb[locale]}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <Button size="sm" onClick={onRun} className="pl-3.5 pr-4">
          <Play className="ml-px size-3.5 fill-current" />
          {t.run}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setSource(DEFAULT_SOURCE);
            setConsoleState({ output: [], value: null, error: null });
          }}
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">{t.reset}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={copyOut}>
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          <span className="hidden sm:inline">{copied ? t.copied : t.copy}</span>
        </Button>
        <span className="ml-auto hidden text-xs text-subtle sm:inline">{t.shortcut}</span>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2 sm:px-4">
        {TARGETS.map((lang) => (
          <button
            key={lang.id}
            type="button"
            onClick={() => setTarget(lang.id)}
            className={cn(
              "h-9 shrink-0 rounded-sm px-3 text-xs tracking-wide",
              target === lang.id ? "bg-accent text-accent-fg" : "text-muted hover:bg-elevated hover:text-fg",
            )}
          >
            {lang.name}
          </button>
        ))}
      </div>

      <div className="flex border-b border-border md:hidden">
        {(["source", "emit", "console"] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setPane(id)}
            className={cn(
              "h-11 flex-1 text-sm",
              pane === id ? "border-b border-fg text-fg" : "text-muted",
            )}
          >
            {id === "source" ? t.source : id === "emit" ? t.output : t.console}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        {pane === "source" ? (
          <CodePane value={source} onChange={setSource} html={sourceHtml} label={t.source} className="min-h-64" />
        ) : null}
        {pane === "emit" ? (
          <CodePane
            value={emitted.ok ? emitted.code : ""}
            html={emitHtml}
            readOnly
            label={t.output}
            className="min-h-64"
          />
        ) : null}
        {pane === "console" ? <ConsoleBody text={consoleText} error={Boolean(consoleState.error)} /> : null}
      </div>

      <div className="hidden min-h-0 flex-1 md:flex md:flex-col">
        <Group orientation="vertical" className="flex min-h-0 flex-1 flex-col" defaultLayout={{ editors: 72, console: 28 }}>
          <Panel id="editors" minSize={40} className="min-h-0">
            <Group orientation="horizontal" className="flex h-full min-h-0" defaultLayout={{ source: 50, emit: 50 }}>
              <Panel id="source" minSize={25} className="min-h-0">
                <div className="flex h-full min-h-0 flex-col">
                  <PaneLabel>{t.source}</PaneLabel>
                  <CodePane value={source} onChange={setSource} html={sourceHtml} label={t.source} />
                </div>
              </Panel>
              <Separator className="w-px bg-border data-[separator=active]:bg-accent" />
              <Panel id="emit" minSize={25} className="min-h-0">
                <div className="flex h-full min-h-0 flex-col">
                  <PaneLabel>
                    {t.output}
                    <span className="ml-2 font-sans text-subtle">
                      .{TARGETS.find((x) => x.id === target)?.ext}
                    </span>
                  </PaneLabel>
                  <CodePane
                    value={emitted.ok ? emitted.code : ""}
                    html={emitHtml}
                    readOnly
                    label={t.output}
                  />
                </div>
              </Panel>
            </Group>
          </Panel>
          <Separator className="h-px bg-border data-[separator=active]:bg-accent" />
          <Panel id="console" minSize={16} className="min-h-0">
            <div className="flex h-full min-h-0 flex-col">
              <PaneLabel>{t.console}</PaneLabel>
              <ConsoleBody text={consoleText} error={Boolean(consoleState.error)} />
            </div>
          </Panel>
        </Group>
      </div>
    </div>
  );
}

function PaneLabel({ children }: { children: import("react").ReactNode }) {
  return (
    <div className="flex h-9 shrink-0 items-center border-b border-border px-3 font-mono text-xs uppercase tracking-wider text-muted">
      {children}
    </div>
  );
}

function ConsoleBody({ text, error }: { text: string; error: boolean }) {
  return (
    <pre
      className={cn(
        "min-h-32 flex-1 overflow-auto bg-bg px-4 py-3 font-mono text-sm leading-6 whitespace-pre-wrap",
        error ? "text-danger" : "text-fg",
      )}
    >
      {text}
    </pre>
  );
}
