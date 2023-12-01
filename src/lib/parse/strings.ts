import { map } from "lodash"
import * as comb from "./combinator"
import { Parser, left, right } from "."

export function mapErrJoin<I, O>(parser: Parser<I, string[], O>, deli: string = "\n"): Parser<I, string, O> {
  return comb.mapErr((errs) => errs.join(deli), parser)
}
export function mapJoin<I, L>(parser: Parser<I, L, string[]>, deli: string = ""): Parser<I, L, string> {
  return comb.map((values) => right(values.join(deli)), parser)
}
export function seqMapJoin<I, L>(parsers: Parser<I, L, string>[], deli: string = ""): Parser<I, L, string> {
  return mapJoin(comb.seq(...parsers), deli)
}

export function text(expect: string): Parser<string, string, string> {
  return (input: string) => {
    if (input.startsWith(expect)) {
      return right({
        data: expect,
        unmatch: input.substring(expect.length),
      })
    } else {
      return left(`Text missing: expect '${expect}', got ${input}`)
    }
  }
}

export function anyStringOf(str: string): Parser<string, string, string> {
  return mapErrJoin(mapJoin(comb.many(comb.alt(...map(Array.from(str), text)))))
}

export function digit0(): Parser<string, string, string> {
  return anyStringOf("0123456789")
}

export function digit(): Parser<string, string, string> {
  return anyStringOf("123456789")
}

export function alphabetUpper(): Parser<string, string, string> {
  return anyStringOf("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
}

export function alphabetLower(): Parser<string, string, string> {
  return anyStringOf("abcdefghijklmnopqrstuvwxyz")
}

export function alphabet(): Parser<string, string, string> {
  return mapErrJoin(mapJoin(comb.many(comb.alt<string, string, string>(alphabetUpper(), alphabetLower()))))
}

export function hex(): Parser<string, string, string> {
  return seqMapJoin([text("0"), mapErrJoin(comb.alt(text("x"), text("X"))), anyStringOf("0123456789abcdefABCDEF")])
}

export function space(): Parser<string, string, string> {
  return anyStringOf(" \t")
}

export function manyUntil<L>(parser: Parser<string, L, string>): Parser<string, L, string> {
  return (input: string) => {
    let result = ""
    let inp = input
    let lastResult = parser(inp)
    while (lastResult.ty == "left") {
      result += inp.substring(0, 1)
      inp = inp.substring(1)
      if (inp.length == 0) {
        return lastResult
      }
      lastResult = parser(inp)
    }
    return right({
      data: result,
      unmatch: lastResult.value.unmatch,
    })
  }
}
