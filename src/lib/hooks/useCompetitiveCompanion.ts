import { disableCompetitiveCompanion, enableCompetitiveCompanion } from "@/lib/ipc/competitive-companion"
import { DependencyList, useEffect } from "react"
import { event } from "@tauri-apps/api"

type Test = {
  input: string
  output: string
}
type Batch = {
  /**
   * A UUIDv4 string which uniquely identifies a batch. All problems in a batch have the same batch id.
   */
  id: string
  /**
   * The size of the batch, which is 1 when using a problem parser and the amount of problems in the contest when using a contest parser.
   */
  size: number
}

type InputTypeStdin = {
  type: "stdin"
}
type InputTypeFile = {
  type: "file"
  fileName: string
}
type InputTypeRegex = {
  type: "regex"
  pattern: string
}

type OutputTypeStdout = {
  type: "stdou"
}
type OutputTypeFile = {
  type: "file"
  fileName: string
}

type Problem = {
  /**
   * The full name of the problem. Can be used for display purposes.
   */
  name: string
  /**
   * Used to group problems together, which can be useful for archiving purposes.
   * Follows the format <judge> - <category>, where the hyphen is discarded if the category is empty.
   */
  group: string
  /**
   * A link to the problem on the judge's website.
   */
  url: string
  /**
   * Whether this is an interactive problem or not.
   */
  interactive?: boolean
  /**
   * The memory limit in MB.
   */
  memoryLimit: number
  /**
   * The time limit in ms.
   */
  timeLimit: number
  /**
   *  An array of objects containing testcase data.
   *  The JSON objects in the array all have two keys: input and output.
   *  Both the input and the output need to end with a newline character.
   */
  tests: Test[]
  /**
   * The type of the tests.
   * Supports two options: "single" and "multiNumber".
   * Explanation of these two can be found on the JHelper wiki https://github.com/AlexeyDmitriev/JHelper/wiki/Usage.
   */
  testType: "single" | "multiNumber"
  /**
   * An object which is used to configure how to receive input. Supported types:
   *  stdin: Receive input via stdin. No additional options required.
   *  file: Receive input via a file. The file name has to be given via the fileName option.
   *  regex: Receive input via a file. The file to use is selected by taking the most recently modified that matches the given regex.
   *         The regex pattern to use has to be given via the pattern option.
   */
  input: InputTypeFile | InputTypeRegex | InputTypeStdin
  /**
   * An object which is used to configure how to send output. Supported types:
   *  stdout: Send output to stdout. No additional options required.
   *  file: Send output to a file. The file name has to be given via the fileName option.
   */
  output: OutputTypeFile | OutputTypeStdout
  /**
   * An object with language specific settings.
   * At the moment this only contains Java settings,
   * but since I don't think putting language specific settings as top-level options is a good idea, I decided to put them in an object.
   * This also allows for other languages to have custom configuration added later on.
   */
  languages?: {
    /**
     * An object with Java specific settings.
     */
    java?: {
      /**
       * The name of the outer class containing the solution.
       */
      mainClass: string
      /**
       * The classname-friendly version of the problem's full name.
       * Cannot be the same as mainClass.
       * Can also be useful for non-Java tools because a classname-friendly string is also a filename-friendly string.
       */
      taskClass: string
    }
  }
  /**
   * An object containing information about the batch of problems that this problem belongs to. Required options:
   */
  batch: Batch
}

export function useCompetitiveCompanion(listener: (data: Problem) => void, deps?: DependencyList | undefined) {
  useEffect(() => {
    enableCompetitiveCompanion().catch()
    return () => {
      disableCompetitiveCompanion()
    }
  }, [])
  useEffect(() => {
    let unlisten = event.listen("competitive-companion", (data) => {
      listener(JSON.parse(data.payload as string))
    })
    return () => {
      unlisten.then((fn) => fn())
    }
  }, deps)
}
