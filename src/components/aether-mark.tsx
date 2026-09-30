import { cn } from "@/lib/utils";

export function AetherMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-accent", className)}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 3.5 L28.5 26.5 H3.5 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="miter"
      />
      <path d="M8.2 17.2 H23.8" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
