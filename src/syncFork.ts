import run from '../utils/run.ts'

export default async (downstreams) => {
  for (const cwd of downstreams) {
    await run('git switch dev', { cwd })
    await run('git fetch up', { cwd })
    try {
      await run('git merge up/dev', { cwd })
      console.log(`\n${cwd} is up-to-date with upstream`)
    } catch (e) {
      console.error(`\nSync ${cwd} failed`)
      console.error(e)
    }
  }
}
