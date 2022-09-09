import { Checkbox } from 'https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts'
import run from './utils/run.ts'

export default async (cmd: string[]) => {
  const realPath = Deno.realPathSync('.')

  const dirs = Deno.readDirSync('.'); const options: { name: string; value: string; checked: boolean }[] = []
  for (const { name, isDirectory } of dirs) {
    if (isDirectory) {
      options.push({ name, value: `${realPath}\\${name}`, checked: true })
    }
  }

  const cwds: string[] = await Checkbox.prompt({
    message: 'Pick directories',
    options,
    minOptions: 1,
    hint: 'Press \'u\' for up and \'d\' for down.',
  })

  for (const cwd of cwds) {
    await run({ cmd, cwd })
  }
}
