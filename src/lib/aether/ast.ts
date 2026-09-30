export type Loc = { line: number; col: number };

export type TypeRef = string;

export type Param = { name: string; type: TypeRef | null };

export type Program = { kind: "program"; body: Top[]; loc: Loc };

export type Top = FnDecl | TypeDecl | Stmt;

export type FnDecl = {
  kind: "fn";
  name: string;
  params: Param[];
  ret: TypeRef | null;
  body: Stmt[];
  loc: Loc;
};

export type TypeDecl = {
  kind: "type";
  name: string;
  fields: Param[];
  loc: Loc;
};

export type Stmt =
  | LetStmt
  | AssignStmt
  | IfStmt
  | ForStmt
  | WhileStmt
  | ReturnStmt
  | ExprStmt;

export type LetStmt = {
  kind: "let";
  name: string;
  type: TypeRef | null;
  value: Expr;
  isConst: boolean;
  loc: Loc;
};

export type AssignStmt = {
  kind: "assign";
  target: Expr;
  value: Expr;
  loc: Loc;
};

export type IfStmt = {
  kind: "if";
  cond: Expr;
  then: Stmt[];
  elseIfs: { cond: Expr; body: Stmt[]; loc: Loc }[];
  else: Stmt[] | null;
  loc: Loc;
};

export type ForStmt = {
  kind: "for";
  name: string;
  iter: Expr;
  body: Stmt[];
  loc: Loc;
};

export type WhileStmt = {
  kind: "while";
  cond: Expr;
  body: Stmt[];
  loc: Loc;
};

export type ReturnStmt = { kind: "return"; value: Expr | null; loc: Loc };

export type ExprStmt = { kind: "expr"; expr: Expr; loc: Loc };

export type Expr =
  | BinaryExpr
  | UnaryExpr
  | CallExpr
  | IndexExpr
  | MemberExpr
  | IdentExpr
  | LiteralExpr
  | ListExpr
  | MapExpr
  | StructExpr
  | RangeExpr;

export type BinaryExpr = {
  kind: "binary";
  op: string;
  left: Expr;
  right: Expr;
  loc: Loc;
};

export type UnaryExpr = { kind: "unary"; op: string; expr: Expr; loc: Loc };

export type CallExpr = { kind: "call"; callee: Expr; args: Expr[]; loc: Loc };

export type IndexExpr = { kind: "index"; obj: Expr; index: Expr; loc: Loc };

export type MemberExpr = { kind: "member"; obj: Expr; name: string; loc: Loc };

export type IdentExpr = { kind: "ident"; name: string; loc: Loc };

export type LiteralExpr = {
  kind: "literal";
  value: number | string | boolean | null;
  raw: "int" | "float" | "str" | "bool" | "null";
  loc: Loc;
};

export type ListExpr = { kind: "list"; items: Expr[]; loc: Loc };

export type MapExpr = { kind: "map"; entries: { key: string; value: Expr }[]; loc: Loc };

export type StructExpr = {
  kind: "struct";
  name: string;
  entries: { key: string; value: Expr }[];
  loc: Loc;
};

export type RangeExpr = { kind: "range"; start: Expr; end: Expr; loc: Loc };

export type CompileError = { message: string; line: number; col: number };
