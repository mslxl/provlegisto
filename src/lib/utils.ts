import { type ClassValue, clsx } from "clsx"
import { reverse } from "lodash"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 过滤不匹配的 CSS 字符串中的引号
 * 避免破坏样式
 * @param text
 * @returns
 */
export function filterCSSQuote(text: string): string {
  let result = ""
  const stack = []
  let double = 0
  let single = 0
  for (const ch of text) {
    stack.push(ch)
    if (ch === '"') {
      double++
      if (double % 2 === 0) {
        let tmp = ""
        let top: string | undefined = ""
        tmp += stack.pop()
        while ((top = stack.pop()) !== '"') {
          if (top === undefined) return result
          if (top === "'") return result
          tmp += top
        }
        tmp += top
        result += reverse(tmp.split("")).join("")
      }
    } else if (ch === "'") {
      single++
      if (single % 2 === 0) {
        let tmp = ""
        let top: string | undefined = ""
        tmp += stack.pop()
        while ((top = stack.pop()) !== "'") {
          if (top === undefined) return result
          if (top === '"') return result
          tmp += top
        }
        tmp += top
        result += reverse(tmp.split("")).join("")
      }
    } else if (single % 2 === 0 && double % 2 === 0) {
      result += stack.pop()
    }
  }
  return result
}


export function normalizeColor(hex: string, fillColor: string = '00'): string{
  const result = hex.match(/^#?((?:[\d(?:a-f)(?:A-F)]{2}){1,3})/)
  if(result == null) return `#${fillColor}${fillColor}${fillColor}`
  const value = result[1]
  return `#${value.padEnd(6, fillColor)}`
}
