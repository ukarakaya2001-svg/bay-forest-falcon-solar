export type TargetId =
  | "javascript"
  | "typescript"
  | "python"
  | "go"
  | "rust"
  | "c"
  | "cpp"
  | "java"
  | "csharp"
  | "ruby"
  | "swift"
  | "kotlin"
  | "php"
  | "dart"
  | "lua"
  | "scala"
  | "elixir"
  | "haskell";

export type Family = "brace" | "indent" | "end" | "hs";

export type Target = {
  id: TargetId;
  name: string;
  ext: string;
  family: Family;
  ifParens: boolean;
  semi: boolean;
  elif: string;
  thenWord: string | null;
  endWord: string | null;
  comment: string;
  color: string;
};

export const TARGETS: Target[] = [
  { id: "javascript", name: "JavaScript", ext: "js", family: "brace", ifParens: true, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#c5d0cc" },
  { id: "typescript", name: "TypeScript", ext: "ts", family: "brace", ifParens: true, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#a8b4c4" },
  { id: "python", name: "Python", ext: "py", family: "indent", ifParens: false, semi: false, elif: "elif", thenWord: null, endWord: null, comment: "#", color: "#d4c4a8" },
  { id: "go", name: "Go", ext: "go", family: "brace", ifParens: false, semi: false, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#7aa0b8" },
  { id: "rust", name: "Rust", ext: "rs", family: "brace", ifParens: false, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#c4a090" },
  { id: "c", name: "C", ext: "c", family: "brace", ifParens: true, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#a0a8b0" },
  { id: "cpp", name: "C++", ext: "cpp", family: "brace", ifParens: true, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#8aa4c0" },
  { id: "java", name: "Java", ext: "java", family: "brace", ifParens: true, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#c4b090" },
  { id: "csharp", name: "C#", ext: "cs", family: "brace", ifParens: true, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#9aa88c" },
  { id: "ruby", name: "Ruby", ext: "rb", family: "end", ifParens: false, semi: false, elif: "elsif", thenWord: null, endWord: "end", comment: "#", color: "#c09090" },
  { id: "swift", name: "Swift", ext: "swift", family: "brace", ifParens: false, semi: false, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#d0b090" },
  { id: "kotlin", name: "Kotlin", ext: "kt", family: "brace", ifParens: false, semi: false, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#b0a4c4" },
  { id: "php", name: "PHP", ext: "php", family: "brace", ifParens: true, semi: true, elif: "elseif", thenWord: null, endWord: null, comment: "//", color: "#a4a0c0" },
  { id: "dart", name: "Dart", ext: "dart", family: "brace", ifParens: true, semi: true, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#90b0c4" },
  { id: "lua", name: "Lua", ext: "lua", family: "end", ifParens: false, semi: false, elif: "elseif", thenWord: "then", endWord: "end", comment: "--", color: "#90a4c0" },
  { id: "scala", name: "Scala", ext: "scala", family: "brace", ifParens: false, semi: false, elif: "else if", thenWord: null, endWord: null, comment: "//", color: "#c49090" },
  { id: "elixir", name: "Elixir", ext: "ex", family: "end", ifParens: false, semi: false, elif: "else if", thenWord: "do", endWord: "end", comment: "#", color: "#a090c0" },
  { id: "haskell", name: "Haskell", ext: "hs", family: "hs", ifParens: false, semi: false, elif: "else if", thenWord: "then", endWord: null, comment: "--", color: "#90b09c" },
];

export function targetById(id: TargetId): Target {
  return TARGETS.find((t) => t.id === id) ?? TARGETS[0]!;
}
