import { Checkbox } from 'https://deno.land/x/cliffy@v0.25.0/prompt/mod.ts'
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

  const cmdStr = cmd.join(' ')
  for (const cwd of cwds) {
    console.log(`\n%cRunning "${cmdStr}" in ${cwd}...`, 'color:#409EFF; font-weight:bold;')
    await run({ cmd, cwd })
  }
}
