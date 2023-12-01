import { expect, test } from "vitest"
import { commentCxx, problemHeaderWithCommentParser, problemLine } from "./problem"
import { right } from "."

test("test problem line", () => {
  expect(problemLine(commentCxx)("// Title: A. Hello\n")).toEqual(
    right({
      unmatch: "",
      data: ["Title", "A. Hello"],
    }),
  )
})

test("test problem header", () => {
  expect(problemHeaderWithCommentParser(commentCxx)(`// Title: A. Hello
// Memory: 512MiB
`)).toEqual(
    right({
      unmatch: "",
      data: {
        title: 'A. Hello',
        memory: '512MiB'
      }
    }),
  )
})
