import { Either, Parser, left, right } from "."

export function map<I, L, O, R>(transformer: (output: O) => Either<L, R>, parser: Parser<I, L, O>): Parser<I, L, R> {
  return (input: I) => {
    const result = parser(input)
    if (result.ty == "right") {
      const data = transformer(result.value.data)
      if (data.ty == "left") {
        return data
      } else {
        return right({
          data: data.value,
          unmatch: result.value.unmatch,
        })
      }
    }
    return result
  }
}

export function mapErr<I, L, O, E>(transformer: (error: L) => E, parser: Parser<I, L, O>): Parser<I, E, O> {
  return (input: I) => {
    const result = parser(input)
    if (result.ty == "left") return left(transformer(result.error))
    return result
  }
}

export function seq<I, L, O>(...parsers: Parser<I, L, O>[]): Parser<I, L, O[]> {
  return (input: I) => {
    let result: O[] = []
    let inp = input
    for (const p of parsers) {
      const temp = p(inp)
      if (temp.ty == "left") {
        return temp
      }
      result.push(temp.value.data)
      inp = temp.value.unmatch
    }
    return right({
      data: result,
      unmatch: inp,
    })
  }
}

export function opt<I, L, O>(parser: Parser<I, L, O>, defaultValue: O): Parser<I, L, O> {
  return (input: I) => {
    const result = parser(input)
    if (result.ty == "left") {
      return right({
        data: defaultValue,
        unmatch: input,
      })
    } else {
      return result
    }
  }
}

export function alt<I, L, O>(...parsers: Parser<I, L, O>[]): Parser<I, L[], O> {
  return (input: I) => {
    let errors = []
    for (const p of parsers) {
      const result = p(input)
      if (result.ty == "right") {
        return result
      } else {
        errors.push(result.error)
      }
    }
    return left(errors)
  }
}

export function many<I, L, O>(parser: Parser<I, L, O>): Parser<I, L, O[]> {
  return (input: I) => {
    let result: O[] = []
    let inp: I = input
    let lastError: L | null = null
    while (true) {
      const temp = parser(inp)
      if (temp.ty == "left") {
        lastError = temp.error
        break
      }
      inp = temp.value.unmatch
      result.push(temp.value.data)
    }
    if (result.length == 0) return left(lastError!)
    else
      return right({
        data: result,
        unmatch: inp,
      })
  }
}

export function many0<I, L, O>(parser: Parser<I, L, O>): Parser<I, L, O[]> {
  return opt(many(parser), [])
}
