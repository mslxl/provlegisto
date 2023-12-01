export type Left<L> = {
  ty: "left"
  error: L
}
export type Right<R> = {
  ty: "right"
  value: R
}

export type Either<L, R> = Left<L> | Right<R>

export function left<L, R = never>(error: L): Either<L, R> {
  return {
    ty: "left",
    error,
  }
}

export function right<R, L = never>(value: R): Either<L, R> {
  return {
    ty: "right",
    value,
  }
}

export function unwrap_left<L, R = never>(value: Either<L, R>): Left<L> {
  if (value.ty == "left") return value
  throw new Error("Unwrap error: target is not left")
}

export function unwrap<R, L = never>(value: Either<L, R>): Right<R> {
  if (value.ty == "right") return value
  throw new Error(`Unwrap error: target is not right\n${value.error}`)
}

export type Match<D, R> = {
  data: D
  unmatch: R
}

export type Parser<I, L, O> = (input: I) => Either<L, Match<O, I>>

import * as combinator from "./combinator"
import * as strings from "./strings"
export const parse = {
  ...combinator,
  ...strings,
  left,
  right,
  unwrap,
  unwrap_left,
}
