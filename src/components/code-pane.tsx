import { useEffect, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange?: (next: string) => void;
  html: string;
  readOnly?: boolean;
  label: string;
  className?: string;
};

export function CodePane({ value, onChange, html, readOnly, label, className }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const lines = value.length === 0 ? 1 : value.split("\n").length;

  const sync = () => {
    const src = readOnly ? preRef.current : taRef.current;
    const pre = preRef.current;
    const gutter = gutterRef.current;
    if (!src) return;
    if (pre && pre !== src) {
      pre.scrollTop = src.scrollTop;
      pre.scrollLeft = src.scrollLeft;
    }
    if (gutter) gutter.scrollTop = src.scrollTop;
  };

  useEffect(() => {
    sync();
  }, [value, html]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Tab" || !onChange) return;
    e.preventDefault();
    const el = e.currentTarget;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = value.slice(0, start) + "  " + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2;
    });
  };

  return (
    <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col bg-surface", className)}>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          aria-hidden
          ref={gutterRef}
          className="select-none overflow-hidden border-r border-border bg-bg py-3 pr-2 pl-3 font-mono text-xs leading-6 text-subtle tabular-nums"
        >
          {Array.from({ length: lines }, (_, i) => (
            <div key={i} className="text-right">
              {i + 1}
            </div>
          ))}
        </div>
        <div className="relative min-h-0 min-w-0 flex-1">
          <pre
            ref={preRef}
            onScroll={sync}
            className={cn(
              "absolute inset-0 overflow-auto px-3 py-3 font-mono text-xs leading-6 whitespace-pre sm:text-sm",
              readOnly ? "" : "pointer-events-none",
            )}
            dangerouslySetInnerHTML={{ __html: html || " " }}
          />
          {readOnly ? (
            <span className="sr-only">{label}</span>
          ) : (
            <textarea
              ref={taRef}
              value={value}
              onChange={(e) => onChange?.(e.target.value)}
              onScroll={sync}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-label={label}
              className="absolute inset-0 resize-none overflow-auto bg-transparent px-3 py-3 font-mono text-xs leading-6 text-transparent caret-accent outline-none sm:text-sm"
            />
          )}
        </div>
      </div>
    </div>
  );
}
