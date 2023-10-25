import { fs, path } from "@tauri-apps/api"
import { type SettingsState } from "../store/settings"

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
  const basename = await path.basename(sourcePath, await path.extname(sourcePath))
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
  const basename = await path.basename(sourcePath, await path.extname(sourcePath))
  const inputFilename = await path.join(storeageDir, formatTestcaseName(basename, index, config.testcaseInputFormat))
  const outputFilename = await path.join(storeageDir, formatTestcaseName(basename, index, config.testcaseOutputFormat))
  if ((await path.resolve(inputFilename)) !== (await path.resolve(inputFile))) {
    await fs.copyFile(inputFile, inputFilename)
  }
  if ((await path.resolve(outputFilename)) !== (await path.resolve(outputFile))) {
    await fs.copyFile(outputFile, outputFilename)
  }
}
