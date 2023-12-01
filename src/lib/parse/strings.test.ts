import { expect, test } from "vitest"
import { digit, digit0, hex, manyUntil, text } from "./strings"
import { right } from "."

test("parse text", () => {
  expect(text("abcd")("abcdefg")).toEqual(
    right({
      data: "abcd",
      unmatch: "efg",
    }),
  )
  expect(text("bcd")("abcdefg").ty).toEqual("left")
})

test("parse digit", () => {
  expect(digit()("1234b")).toEqual(
    right({
      data: "1234",
      unmatch: "b",
    }),
  )
  expect(digit()("nan").ty).toEqual("left")
  expect(digit()("01234b").ty).toEqual("left")
  expect(digit()("0x3abcd").ty).toEqual("left")
})

test("parse digit0", () => {
  expect(digit0()("1234b")).toEqual(
    right({
      data: "1234",
      unmatch: "b",
    }),
  )
  expect(digit0()("nan").ty).toEqual("left")
  expect(digit0()("01234b")).toEqual(
    right({
      data: "01234",
      unmatch: "b",
    }),
  )
  expect(digit0()("0x3abcd")).toEqual(
    right({
      data: "0",
      unmatch: "x3abcd",
    }),
  )
})

test("parse hex", () => {
  expect(hex()("66ccff").ty).toEqual("left")
  expect(hex()("0x66ccff")).toEqual(
    right({
      data: "0x66ccff",
      unmatch: "",
    }),
  )
  expect(hex()("z0x66ccff").ty).toEqual("left")
})

test("parse manyUntil", () => {
  expect(manyUntil(text(" lazy "))("the fox jump over the lazy dog")).toEqual(
    right({
      data: "the fox jump over the",
      unmatch: "dog",
    }),
  )
  expect(manyUntil(text("\n"))("the fox jump over the lazy dog").ty).toEqual("left")
  expect(manyUntil(text("\n"))("the fox jump over the lazy dog\nthe fox jump over the lazy dog")).toEqual(
    right({
      data: "the fox jump over the lazy dog",
      unmatch: "the fox jump over the lazy dog",
    }),
  )
})
