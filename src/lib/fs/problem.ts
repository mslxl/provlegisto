import { fs, path } from "@tauri-apps/api"
import { LanguageMode, availableInternalChecker } from "../ipc"
import * as log from "tauri-plugin-log-api"
import { ProblemHeader, problemHeader } from "../parse/problem"
import { parse, right } from "../parse"
import { capitalize } from "lodash"
import { map, __, addIndex, flatten } from "ramda"
import { crc16 } from "crc"
import { StaticSourceData, StaticTestData } from "./model"

/**
 * get language mode from file extension name
 * @param extName
 * @returns
 */
export function getLanguageModeByExt(extName: string): LanguageMode {
  let e = extName.toLowerCase()
  if (e == "c" || e == "cpp") return LanguageMode.CXX
  else if (e == "py") return LanguageMode.PY
  log.error(`unreconginze extension name ${extName}, fallback to c++`)
  return LanguageMode.UNKNOW
}

export function getExtByLanguageMode(language: LanguageMode): string {
  switch (language) {
    case LanguageMode.CXX:
      return "cpp"
    case LanguageMode.PY:
      return "py"
    default:
      break
  }
  return "txt"
}

/**
 * parse basic info from file head
 * throw error if it failed
 * @param source
 * @returns
 */
function parseHeader(source: string): ProblemHeader {
  let result = problemHeader()(source)
  if (result.ty == "left") {
    // DO NOT THROW ERROR HERE
    // the data always be needed even if there is no header
    log.error(result.error)
    return {} // no metadata found
  }else{
    return result.value.data
  }
}

/**
 * read testcase from dir
 * @param dirname
 * @param basename
 * @returns
 */
async function readTestcases(dirname: string, basename: string): Promise<StaticTestData[]> {
  let result = []
  // TODO: read testcase data by pattern, which should be configurable
  for (let index = 1; ; index++) {
    let input = await path.join(dirname, `${basename}_${index}.in`)
    let except = await path.join(dirname, `${basename}_${index}.out`)
    if (!(await fs.exists(input)) || !(await fs.exists(except))) break
    const [inp, exc] = await Promise.all([fs.readTextFile(input), fs.readTextFile(except)])
    result.push({
      input: inp,
      except: exc,
    })
  }
  return result
}

/**
 * Parse info from file
 * @param filePath
 * @returns
 */
async function parseSrcFile(filePath: string): Promise<StaticSourceData> {
  const source = await fs.readTextFile(filePath)
  const extName = await path.extname(filePath)
  const dirName = await path.dirname(filePath)
  const languageMode = getLanguageModeByExt(extName)
  const header = parseHeader(source)
  const timeLimits =
    header.time == undefined
      ? 3000
      : parse.unwrap(
          parse.map(
            ([time]: string[]) => right(parseInt(time)),
            parse.seq(parse.opt(parse.mapJoin(parse.many(parse.digit0())), "3000"), parse.text("ms")), //TODO: set default tle time by config
          )(header.time),
        ).value.data
  const memoryLimits =
    header.memory == undefined
      ? 256
      : parse.unwrap(
          parse.map(
            ([mem]: string[]) => right(parseInt(mem)),
            parse.seq(parse.opt(parse.mapJoin(parse.many(parse.digit0())), "256"), parse.text("mb")), //TODO: set default mle memory by config
          )(header.memory!),
        ).value.data
  const checker =
    header.checker == undefined ? "wcmp" : availableInternalChecker.find((v) => v == header.checker!) ?? "wcmp"

  const basename = await path.basename(filePath, "." + extName)

  const title = header.problem ?? basename
  const testcases = await readTestcases(dirName, basename)

  let result: StaticSourceData = {
    name: title,
    url: header.url,
    contestUrl: header.contest,
    private: true,
    language: languageMode,
    source: source,
    timelimit: timeLimits,
    memorylimit: memoryLimits,
    checker: checker,
    tests: testcases,
  }
  return result
}

export async function openProblem(files: string[]): Promise<StaticSourceData[]> {
  return await Promise.all(map(parseSrcFile, files))
}

/**
 * Save source object to file
 * This function will remove the header and generate new header according to source object
 * @param source
 * @param title
 * @param filepath
 * @returns CRC16
 */
export async function saveProblem(source: StaticSourceData, filepath: string): Promise<number> {
  const sourceCode = (() => {
    let result = problemHeader()(source.source)
    if (result.ty == "left") return source.source
    else return result.value.unmatch
  })()

  const commentPrefix = (() => {
    if (source.language == LanguageMode.CXX) return "// "
    else if (source.language == LanguageMode.PY) return "# "
    return "# "
  })()

  const header = (() => {
    let header: ProblemHeader = {
      problem: source.name,
      url: source.url,
      contest: source.contestUrl,
      memory: `${source.memorylimit}mb`,
      time: `${source.timelimit}ms`,
      checker: source.checker,
    }

    return Object.entries(header)
      .reduce((prev, cur) => {
        if (cur[1]) {
          return `${prev}\n${commentPrefix}${capitalize(cur[0])}: ${cur[1]}`
        } else {
          return prev
        }
      }, "")
      .trimStart()
  })()

  const filecontent = `${header}\n${sourceCode}`
  await fs.writeTextFile(filepath, filecontent)
  const extname = await path.extname(filepath)
  const dirname = await path.dirname(filepath)
  const basename = await path.basename(filepath, `.${extname}`)

  const testcaseWritingPromise = flatten(
    addIndex(map)((testItem, index) => {
      const item = testItem as StaticTestData
      const input = path.join(dirname, `${basename}_${index + 1}.in`)
      const output = path.join(dirname, `${basename}_${index + 1}.out`)
      return [input.then((f) => fs.writeTextFile(f, item.input)), output.then((f) => fs.writeTextFile(f, item.except))]
    }, source.tests),
  )
  await Promise.all(testcaseWritingPromise)
  return crc16(filecontent)
}
