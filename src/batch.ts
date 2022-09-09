import run from './utils/run.ts'
import { Checkbox } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts"

export default async (command, { all = false }) => {
  const realPath = Deno.realPathSync('.')

  const dirs = Deno.readDirSync('.'), options = []
  for (const { name, isDirectory } of dirs) {
    if (isDirectory) {
      options.push({ name, value: `${realPath}\\${name}`, checked: all })
    }
  }

  const cwds: string[] = await Checkbox.prompt({
    message: "Pick directories",
    options,
    minOptions: 1,
    hint: "Press 'u' for up and 'd' for down.",
  })

  for (const cwd of cwds) {
    await run(command, { cwd })
  }
}
