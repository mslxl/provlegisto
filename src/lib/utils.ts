import { type ClassValue, clsx } from "clsx"
import { crc24 } from "crc"
import { random, reverse } from "lodash"
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

export function randomColor() {
  const r = random(0, 255).toString(16).padStart(2, "0").toUpperCase()
  const g = random(0, 255).toString(16).padStart(2, "0").toUpperCase()
  const b = random(0, 255).toString(16).padStart(2, "0").toUpperCase()
  return `#${r}${g}${b}`
}

export function generateColorFromString(name: string) {
  return "#" + crc24(name).toString(16).padStart(6, "0")
}

export function shadeColor(hexColor: string, magnitude: number): string {
  hexColor = hexColor.replace(`#`, ``)
  if (hexColor.length === 6) {
    const decimalColor = parseInt(hexColor, 16)
    let r = (decimalColor >> 16) + magnitude
    r > 255 && (r = 255)
    r < 0 && (r = 0)
    let g = (decimalColor & 0x0000ff) + magnitude
    g > 255 && (g = 255)
    g < 0 && (g = 0)
    let b = ((decimalColor >> 8) & 0x00ff) + magnitude
    b > 255 && (b = 255)
    b < 0 && (b = 0)
    return `#${(g | (b << 8) | (r << 16)).toString(16)}`
  } else {
    return hexColor
  }
}
