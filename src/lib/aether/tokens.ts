export type TokKind =
  | "number"
  | "string"
  | "ident"
  | "comment"
  | "fn"
  | "let"
  | "const"
  | "if"
  | "else"
  | "for"
  | "in"
  | "while"
  | "return"
  | "type"
  | "true"
  | "false"
  | "null"
  | "and"
  | "or"
  | "not"
  | "("
  | ")"
  | "{"
  | "}"
  | "["
  | "]"
  | ","
  | ":"
  | "->"
  | "."
  | ".."
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "="
  | "=="
  | "!="
  | "<"
  | ">"
  | "<="
  | ">="
  | ";"
  | "eof";

export type Token = {
  kind: TokKind;
  lexeme: string;
  pos: number;
  line: number;
  col: number;
  value?: string | number;
};
