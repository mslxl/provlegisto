import { camelCase } from "lodash"
import { Parser, right } from "."
import { alt, many, map, seq } from "./combinator"
import { alphabet, manyUntil, mapErrJoin, text } from "./strings"

export function problemLine(commentParser: Parser<string, string, string>): Parser<string, string, [string, string]> {
  return map(
    ([, header, , content]: string[]) => right([header, content]),
    seq(commentParser, alphabet(), text(": "), mapErrJoin(manyUntil(alt(text("\r"), text("\n"))))),
  )
}

export function problemLines(
  commentParser: Parser<string, string, string>,
): Parser<string, string, [string, string][]> {
  return many(problemLine(commentParser))
}

export function problemHeaderWithCommentParser(
  commentParser: Parser<string, string, string>,
): Parser<string, string, ProblemHeader> {
  return map(
    (fields) =>
      right(
        fields.reduce((obj, c) => {
          obj[camelCase(c[0].trim())] = c[1].trim()
          return obj
        }, {} as any),
      ),
    problemLines(commentParser),
  )
}

export function problemHeader(): Parser<string, string, ProblemHeader> {
  return mapErrJoin(alt(...[commentCxx, commentPy].map((p) => problemHeaderWithCommentParser(p))))
}

export const commentCxx = text("// ")
export const commentPy = text("# ")

export type ProblemHeader = {
  problem?: string
  url?: string
  contest?: string
  memory?: string
  time?: string
  checker?: string
}
