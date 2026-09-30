export type Example = {
  id: string;
  title: { tr: string; en: string };
  blurb: { tr: string; en: string };
  code: string;
};

export const EXAMPLES: Example[] = [
  {
    id: "hello",
    title: { tr: "Merhaba", en: "Hello" },
    blurb: { tr: "İlk program. print evrensel çıktıdır.", en: "The first program. print is the universal output." },
    code: `fn main() {
  print("Hello, Aether")
}
`,
  },
  {
    id: "fizzbuzz",
    title: { tr: "FizzBuzz", en: "FizzBuzz" },
    blurb: { tr: "Koşullar, döngüler ve kalan.", en: "Conditions, loops, and remainder." },
    code: `fn main() {
  for i in 1..16 {
    if i % 15 == 0 {
      print("FizzBuzz")
    } else if i % 3 == 0 {
      print("Fizz")
    } else if i % 5 == 0 {
      print("Buzz")
    } else {
      print(i)
    }
  }
}
`,
  },
  {
    id: "fib",
    title: { tr: "Fibonacci", en: "Fibonacci" },
    blurb: { tr: "Özyineleme. Her dilin bildiği bir ritim.", en: "Recursion. A rhythm every language knows." },
    code: `fn fib(n: int) -> int {
  if n <= 1 {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}

fn main() {
  for i in 0..10 {
    print("fib(" + str(i) + ") = " + str(fib(i)))
  }
}
`,
  },
  {
    id: "factorial",
    title: { tr: "Faktöriyel", en: "Factorial" },
    blurb: { tr: "Klasik özyinelemeli tanım.", en: "The classic recursive definition." },
    code: `fn fact(n: int) -> int {
  if n <= 1 {
    return 1
  }
  return n * fact(n - 1)
}

fn main() {
  print(fact(6))
}
`,
  },
  {
    id: "lists",
    title: { tr: "Listeler", en: "Lists" },
    blurb: { tr: "Toplama, dizin ve birleştirme.", en: "Sums, indexes, and concatenation." },
    code: `fn sum(xs: list) -> int {
  let total = 0
  for x in xs {
    total = total + x
  }
  return total
}

fn main() {
  let nums = [3, 1, 4, 1, 5]
  print("len", len(nums))
  print("first", nums[0])
  print("sum", sum(nums))
  print(nums + [9])
}
`,
  },
  {
    id: "person",
    title: { tr: "Kayıt türü", en: "Record type" },
    blurb: { tr: "type ile yapı, alan okuma.", en: "Structs with type, then field access." },
    code: `type Person {
  name: str
  year: int
}

fn greet(p: Person) -> str {
  return "Ada was born in " + str(p.year)
}

fn main() {
  let ada = Person { name: "Ada Lovelace", year: 1815 }
  print(ada.name)
  print(greet(ada))
}
`,
  },
  {
    id: "collatz",
    title: { tr: "Collatz", en: "Collatz" },
    blurb: { tr: "while, çift/tek, bir tahmine kadar.", en: "while, even/odd, down to one." },
    code: `fn collatz(n: int) -> int {
  let steps = 0
  while n != 1 {
    if n % 2 == 0 {
      n = n / 2
    } else {
      n = 3 * n + 1
    }
    steps = steps + 1
  }
  return steps
}

fn main() {
  print("27 takes", collatz(27), "steps")
}
`,
  },
  {
    id: "primes",
    title: { tr: "Asallar", en: "Primes" },
    blurb: { tr: "İç içe döngü ve bir eleğin iskeleti.", en: "Nested loops and the skeleton of a sieve." },
    code: `fn is_prime(n: int) -> bool {
  if n < 2 {
    return false
  }
  for d in 2..n {
    if n % d == 0 {
      return false
    }
  }
  return true
}

fn main() {
  for n in 2..30 {
    if is_prime(n) {
      print(n)
    }
  }
}
`,
  },
  {
    id: "palindrome",
    title: { tr: "Palindrom", en: "Palindrome" },
    blurb: { tr: "Metin, dizin, karşılaştırma.", en: "Strings, indexes, comparison." },
    code: `fn palindrome(s: str) -> bool {
  let i = 0
  let j = len(s) - 1
  while i < j {
    if s[i] != s[j] {
      return false
    }
    i = i + 1
    j = j - 1
  }
  return true
}

fn main() {
  print(palindrome("kayak"))
  print(palindrome("aether"))
}
`,
  },
];

export const DEFAULT_SOURCE = EXAMPLES[1]!.code;
