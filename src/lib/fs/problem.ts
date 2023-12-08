import { Source } from "@/store/source"
import { dialog, fs, path } from "@tauri-apps/api"
import { LanguageMode, availableInternalChecker } from "../ipc"
import * as log from "tauri-plugin-log-api"
import { ProblemHeader, problemHeader } from "../parse/problem"
import { parse, right } from "../parse"
import { capitalize, map } from "lodash"
import { TestCase } from "@/store/testcase"

function parseLanguageMode(extName: string) {
  let e = extName.toLowerCase()
  if (e == "c" || e == "cpp") return LanguageMode.CXX
  else if (e == "py") return LanguageMode.PY
  log.error(`unreconginze extension name ${extName}, fallback to c++`)
  return LanguageMode.CXX
}

function parseHeader(source: string) {
  let result = problemHeader()(source)
  if (result.ty == "left") {
    log.warn(`parse header fail with error:\n${result.error}`)
    return {}
  }
  return result.value.data
}

async function readTestcases(dirname: string, basename: string): Promise<TestCase[]> {
  let result = []
  for (let index = 1; ; index++) {
    let input = await path.join(dirname, `${basename}_${index}.in`)
    let output = await path.join(dirname, `${basename}_${index}.out`)
    if (!(await fs.exists(input)) || !(await fs.exists(output))) break
    const [inp, oup] = await Promise.all([fs.readTextFile(input), fs.readTextFile(output)])
    result.push({
      input: inp,
      output: oup,
    })
  }
  return result
}

async function parseSrcFile(filePath: string): Promise<[string, Source]> {
  const source = await fs.readTextFile(filePath)
  const extName = await path.extname(filePath)
  const dirName = await path.dirname(filePath)
  const languageMode = parseLanguageMode(extName)
  const header = parseHeader(source)
  const timeLimits =
    header.time == undefined
      ? 3000
      : parse.unwrap(
          parse.map(
            ([time]: string[]) => right(parseInt(time)),
            parse.seq(parse.opt(parse.mapJoin(parse.many(parse.digit0())), "3000"), parse.text("ms")),
          )(header.time),
        ).value.data
  const memoryLimits =
    header.memory == undefined
      ? 256
      : parse.unwrap(
          parse.map(
            ([mem]: string[]) => right(parseInt(mem)),
            parse.seq(parse.opt(parse.mapJoin(parse.many(parse.digit0())), "256"), parse.text("mb")),
          )(header.memory!),
        ).value.data
  const checker =
    header.checker == undefined ? "wcmp" : availableInternalChecker.find((v) => v == header.checker!) ?? "wcmp"

  const basename = await path.basename(filePath, "." + extName)

  const title = header.problem ?? basename
  const testcases = await readTestcases(dirName, basename)

  let result: Source = {
    url: header.url,
    path: filePath,
    contest: header.contest,
    code: {
      language: languageMode,
      source: source,
    },
    test: {
      timeLimits,
      memoryLimits,
      checker,
      testcases,
    },
  }
  return [title, result]
}

export async function openProblem(): Promise<[string, Source][]> {
  let problemFiles = await dialog.open({
    multiple: true,
    filters: [
      {
        name: "Source File",
        extensions: ["cpp", "c", "py"],
      },
    ],
  })
  if (problemFiles == null) return []
  if (typeof problemFiles == "string") {
    problemFiles = [problemFiles]
  }
  return Promise.all(map(problemFiles, parseSrcFile))
}

export async function saveProblem(source: Source, title: string, filepath: string) {


  const sourceCode = (() => {
    let result = problemHeader()(source.code.source)
    if (result.ty == "left") return source.code.source
    else return result.value.unmatch
  })()

  const commentPrefix = (() => {
    if (source.code.language == LanguageMode.CXX) return "// "
    else if (source.code.language == LanguageMode.PY) return "# "
    return "# "
  })()

  const header = (() => {
    let header: ProblemHeader = {
      problem: title,
      url: source.url,
      contest: source.contest,
      memory: `${source.test.memoryLimits}mb`,
      time: `${source.test.timeLimits}ms`,
      checker: source.test.checker,
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

  await fs.writeTextFile(filepath, `${header}\n${sourceCode}`)
  const extname = await path.extname(filepath)
  const dirname = await path.dirname(filepath)
  const basename = await path.basename(filepath, `.${extname}`)

  for (let i = 0; i < source.test.testcases.length; i++) {
    const input = await path.join(dirname, `${basename}_${i + 1}.in`)
    const output = await path.join(dirname, `${basename}_${i + 1}.out`)

    await Promise.all([
      fs.writeTextFile(input, source.test.testcases[i].input),
      fs.writeTextFile(output, source.test.testcases[i].output),
    ])
  }
}
