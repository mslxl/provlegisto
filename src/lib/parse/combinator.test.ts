import {test, expect} from 'vitest'
import { opt } from './combinator'
import { text } from './strings'
import { right } from '.'


test("combinate opt", ()=>{
  expect(opt(text("abc"), "")("bcd")).toEqual(right({
    data: '',
    unmatch: 'bcd'
  }))
  expect(opt(text("abc"), "")("abcd")).toEqual(right({
    data: 'abc',
    unmatch: 'd'
  }))
})