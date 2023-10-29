import { fs, path } from "@tauri-apps/api"
import { type SettingsState } from "../store/settings"
import { type Testcase } from "../store/tab"

export async function saveSourceCode(path: string, source: string): Promise<void> {
  await fs.writeTextFile(path, source)
}

function formatTestcaseName(name: string, index: number, format: string): string {
  return format.replace(/\{name\}/g, name).replace(/\{index\}/g, index.toString())
}

export async function saveTextfileTestcase(
  sourcePath: string,
  testcaseInput: string,
  testcaseOutput: string,
  index: number,
  config: SettingsState,
): Promise<void> {
  const storeageDir = await path.dirname(sourcePath)
  const basename = await path.basename(sourcePath, "." + (await path.extname(sourcePath)))
  const inputFilename = formatTestcaseName(basename, index, config.testcaseInputFormat)
  const outputFilename = formatTestcaseName(basename, index, config.testcaseOutputFormat)
  await fs.writeTextFile(await path.join(storeageDir, inputFilename), testcaseInput)
  await fs.writeTextFile(await path.join(storeageDir, outputFilename), testcaseOutput)
}
export async function saveTextfileFromExternalFile(
  sourcePath: string,
  inputFile: string,
  outputFile: string,
  index: number,
  config: SettingsState,
): Promise<void> {
  const storeageDir = await path.dirname(sourcePath)
  const basename = await path.basename(sourcePath, "." + (await path.extname(sourcePath)))
  const inputFilename = await path.join(storeageDir, formatTestcaseName(basename, index, config.testcaseInputFormat))
  const outputFilename = await path.join(storeageDir, formatTestcaseName(basename, index, config.testcaseOutputFormat))
  if ((await path.resolve(inputFilename)) !== (await path.resolve(inputFile))) {
    await fs.copyFile(inputFile, inputFilename)
  }
  if ((await path.resolve(outputFilename)) !== (await path.resolve(outputFile))) {
    await fs.copyFile(outputFile, outputFilename)
  }
}

/**
 * 在目录下搜索测试样例文件
 * @param sourcePath
 * @param config
 * @returns
 */
export async function readTestcases(sourcePath: string, config: SettingsState): Promise<Testcase[]> {
  const storageDir = await path.dirname(sourcePath)
  const basename = await path.basename(sourcePath, "." + (await path.extname(sourcePath)))
  const testcases: Testcase[] = []
  for (let index = 0; ; index++) {
    const inputFilename = await path.join(storageDir, formatTestcaseName(basename, index, config.testcaseInputFormat))
    const outputFilename = await path.join(storageDir, formatTestcaseName(basename, index, config.testcaseOutputFormat))
    if (!(await fs.exists(inputFilename)) || !(await fs.exists(outputFilename))) break
    // 是否大于 1000 字符
    // 若大于 1000 字符，则令 multable = false, 使之仅显示部分文件内容，且不允许编辑
    let isHugeFile = false
    let input = await fs.readTextFile(inputFilename)
    if (input.length > 1000) {
      input = input.substring(0, 1000)
      isHugeFile = true
    }
    let output = await fs.readTextFile(outputFilename)
    if (output.length > 1000) {
      output = output.substring(0, 1000)
      isHugeFile = true
    }
    if (isHugeFile) {
      testcases.push({
        multable: false,
        inputFlie: inputFilename,
        inputOverview: input,
        outputFile: outputFilename,
        outputOverview: output,
      })
    } else {
      testcases.push({
        multable: true,
        input,
        output,
      })
    }
  }
  return testcases
}
