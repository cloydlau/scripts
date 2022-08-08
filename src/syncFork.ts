import { Checkbox } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts"
import run from '../utils/run.ts'

export default async (options) => {
  const forks: string[] = await Checkbox.prompt({
    message: "Pick forks",
    options,
    minOptions: 1,
    hint: "Press u for up and d for down.",
  })

  for (const cwd of forks) {
    await run('git switch dev', { cwd })
    await run('git fetch up', { cwd })
    try {
      await run('git merge up/dev', { cwd })
      console.log(`\n${cwd} is up-to-date with origin`)
    } catch (e) {
      console.error(`\nSync ${cwd} failed`)
      console.error(e)
    }
  }
}
