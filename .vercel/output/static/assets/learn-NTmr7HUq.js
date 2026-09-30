import{c as e,d as t,l as n,p as r,s as i,t as a,u as o}from"./highlight-CukFJzFJ.js";import{t as s}from"./arrow-right-BGoea1Nt.js";import{c,l,r as u,s as d}from"./index-Ce0retBd.js";var f=l(c()),p=[{id:`hello`,title:{tr:`Karşılama`,en:`Welcome`},body:{tr:[`Aether, dillerin ortak paydasından kurulan bir sözdizimidir. Anahtar sözcükler İngilizce’dir; çünkü hedef dillerin neredeyse hepsi öyle konuşur.`,`Bir program fn ile tanımlanan fonksiyonlardan ve isteğe bağlı üst düzey deyimlerden oluşur. Çalıştırıcı, main varsa onu çağırır.`,`Yorum satırı # veya // ile başlar.`],en:[`Aether is a syntax built from the common ground of languages. Keywords stay in English, because nearly every target language does too.`,`A program is functions introduced with fn, plus optional top-level statements. If main exists, the runtime calls it.`,`Comments start with # or //.`]},code:`fn main() {
  print("Hello, Aether")
}
`,exampleId:`hello`},{id:`bindings`,title:{tr:`Bağlamalar`,en:`Bindings`},body:{tr:[`let değişebilir, const değişmez bir ad bağlar. Tür isteğe bağlıdır: int, float, str, bool, list, map veya sizin type ile verdiğiniz ad.`,`Atama adı, dizin veya alan üzerinde çalışır. Tam sayıların bölümü keser; 5 / 2 sonucu 2’dir. Ondalık için 5.0 / 2 yazın.`],en:[`let binds a mutable name, const an immutable one. Types are optional: int, float, str, bool, list, map, or a name you introduced with type.`,`Assignment works on a name, an index, or a field. Integer division truncates: 5 / 2 is 2. Write 5.0 / 2 for a float.`]},code:`fn main() {
  let n: int = 5
  const label = "count"
  n = n + 1
  print(label, n, 5 / 2)
}
`},{id:`functions`,title:{tr:`Fonksiyonlar`,en:`Functions`},body:{tr:[`fn ad(param: tür) -> dönüş { ... }. Parametre ve dönüş türleri atlanabilir.`,`return değeri olmadan da kullanılabilir. Fonksiyonlar özyinelemeli olabilir.`],en:[`fn name(param: type) -> return { ... }. Parameter and return types may be omitted.`,`return may stand alone. Functions may recurse.`]},code:`fn add(a: int, b: int) -> int {
  return a + b
}

fn main() {
  print(add(40, 2))
}
`},{id:`control`,title:{tr:`Akış`,en:`Control`},body:{tr:[`if / else if / else. Koşul parantez almaz. and, or, not sözcükleri kullanılır; && yoktur.`,`Karşılaştırma: == != < > <= >=. true, false, null birer değişmezdir.`],en:[`if / else if / else. Conditions do not take parentheses. Use the words and, or, not — there is no &&.`,`Comparison: == != < > <= >=. true, false, and null are literals.`]},code:`fn abs(n: int) -> int {
  if n < 0 {
    return -n
  } else {
    return n
  }
}

fn main() {
  print(abs(-7))
}
`},{id:`loops`,title:{tr:`Döngüler`,en:`Loops`},body:{tr:[`for ad in ifade { }. Aralık 0..n sağ ucu içermez: 0, 1, …, n-1.`,`while koşul { } koşul yanlış olana dek döner. Sonsuz döngüler bir adım sınırıyla durdurulur.`],en:[`for name in expression { }. A range 0..n is exclusive: 0, 1, …, n-1.`,`while condition { } repeats until the condition is false. Infinite loops stop at a step limit.`]},code:`fn main() {
  for i in 0..4 {
    print(i)
  }
  let n = 3
  while n > 0 {
    print("tick", n)
    n = n - 1
  }
}
`},{id:`lists`,title:{tr:`Liste ve metin`,en:`Lists and strings`},body:{tr:[`Liste [1, 2, 3], dizin xs[0], birleştirme xs + ys. len(xs) uzunluktur.`,`Metin + ile birleşir. str(x) herhangi bir değeri metne çevirir. s[i] tek karakter döner.`],en:[`A list is [1, 2, 3], indexed as xs[0], concatenated as xs + ys. len(xs) is the length.`,`Strings concatenate with +. str(x) stringifies any value. s[i] is a single character.`]},code:`fn main() {
  let xs = [2, 3]
  print(xs[0], len(xs + [5]))
  print("n=" + str(7))
}
`,exampleId:`lists`},{id:`types`,title:{tr:`Kayıtlar`,en:`Records`},body:{tr:[`type Ad { alan: tür } bir kayıt tanımlar. Değer Ad { alan: ifade } ile kurulur. Alanlar nokta ile okunur.`,`Harita { k: v } aynı şekilde alan verir; anahtarlar dizilmez, adlarla anılır.`],en:[`type Name { field: type } declares a record. Construct with Name { field: expression }. Read fields with a dot.`,`A map { k: v } exposes the same field access; keys are names, not quoted indexes.`]},code:`type Point {
  x: int
  y: int
}

fn main() {
  let p = Point { x: 3, y: 4 }
  print(p.x + p.y)
}
`,exampleId:`person`},{id:`builtins`,title:{tr:`Yerleşikler`,en:`Built-ins`},body:{tr:[`print(...) boşlukla birleştirip bir satır yazar. str, int, float dönüştürür. len liste, harita veya metin alır.`,`Açık alanda Ctrl Enter çalıştırır. Sağdaki sütun seçilen dile yapılan çeviridir — okumak içindir; soldaki kaynak gerçekten çalışır.`],en:[`print(...) joins with spaces and writes a line. str, int, and float convert. len takes a list, map, or string.`,`In the playground, Ctrl Enter runs. The right-hand column is a translation into the selected language — for reading. The source on the left is what actually executes.`]},code:`fn main() {
  print(len("Aether"), int("12") + 30)
}
`},{id:`grammar`,title:{tr:`Sözlük`,en:`Lexicon`},body:{tr:[`Anahtar sözcükler: fn let const if else for in while return type true false null and or not`,`Türler: int float str bool list map void — ve sizin type adlarınız.`,`İşleçler: + - * / % == != < > <= >= = ..  ·  Aralık sağ-açık. / tam sayılarda keser.`,`Hedefler: JavaScript, TypeScript, Python, Go, Rust, C, C++, Java, C#, Ruby, Swift, Kotlin, PHP, Dart, Lua, Scala, Elixir, Haskell.`],en:[`Keywords: fn let const if else for in while return type true false null and or not`,`Types: int float str bool list map void — plus names you declare with type.`,`Operators: + - * / % == != < > <= >= = ..  ·  Ranges are right-open. / truncates on integers.`,`Targets: JavaScript, TypeScript, Python, Go, Rust, C, C++, Java, C#, Ruby, Swift, Kotlin, PHP, Dart, Lua, Scala, Elixir, Haskell.`]},code:`fn fib(n: int) -> int {
  if n <= 1 { return n }
  return fib(n - 1) + fib(n - 2)
}

fn main() {
  print(fib(10))
}
`,exampleId:`fib`}],m=d();function h(){let c=o(),l=t(e=>e.locale),[d,h]=(0,f.useState)(p[0].id),g=p.find(e=>e.id===d)??p[0],_=(0,f.useMemo)(()=>a(g.code),[g.code]),v=p.findIndex(e=>e.id===g.id),y=p[v+1];return(0,m.jsx)(n,{children:(0,m.jsxs)(`main`,{className:`mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row`,children:[(0,m.jsxs)(`nav`,{className:`lg:w-56 lg:shrink-0`,children:[(0,m.jsx)(`p`,{className:`mb-3 font-mono text-xs uppercase tracking-wider text-subtle`,children:c.learn}),(0,m.jsx)(`ol`,{className:`flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0`,children:p.map((e,t)=>(0,m.jsx)(`li`,{className:`shrink-0`,children:(0,m.jsxs)(`button`,{type:`button`,onClick:()=>h(e.id),className:r(`flex h-11 items-center gap-3 rounded-sm px-3 text-left text-sm lg:w-full`,e.id===g.id?`bg-elevated text-fg`:`text-muted hover:text-fg`),children:[(0,m.jsx)(`span`,{className:`font-mono text-xs text-subtle tabular-nums`,children:String(t+1).padStart(2,`0`)}),e.title[l]]})},e.id))})]}),(0,m.jsxs)(`article`,{className:`min-w-0 flex-1`,children:[(0,m.jsxs)(`p`,{className:`font-mono text-xs uppercase tracking-wider text-subtle`,children:[c.chapter,` `,String(v+1).padStart(2,`0`)]}),(0,m.jsx)(`h1`,{className:`mt-2 font-display text-4xl italic tracking-tight sm:text-5xl`,children:g.title[l]}),(0,m.jsx)(`div`,{className:`mt-6 max-w-prose space-y-4 text-base leading-relaxed text-muted`,children:g.body[l].map(e=>(0,m.jsx)(`p`,{children:e},e))}),(0,m.jsx)(`div`,{className:`mt-8 h-72 overflow-hidden rounded-lg border border-border bg-surface sm:h-80`,children:(0,m.jsx)(e,{value:g.code,html:_,readOnly:!0,label:g.title[l]})}),(0,m.jsxs)(`div`,{className:`mt-6 flex flex-wrap gap-3`,children:[(0,m.jsx)(i,{asChild:!0,children:(0,m.jsxs)(u,{to:`/playground`,search:g.exampleId?{ex:g.exampleId}:void 0,children:[c.tryIt,(0,m.jsx)(s,{className:`size-4`})]})}),y?(0,m.jsxs)(i,{variant:`outline`,onClick:()=>h(y.id),children:[c.next,`: `,y.title[l]]}):null]})]})]})})}export{h as component};