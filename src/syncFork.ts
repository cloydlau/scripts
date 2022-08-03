import run from '../utils/run.ts'

export default async (downstreams) => {
  for (const k in downstreams) {
    const cwd = downstreams[k]
    await run({ cmd: ['git', 'fetch', 'up'], cwd })
    try {
      await run({ cmd: ['git', 'merge', 'up/dev'], cwd })
      console.log(`\n${k}同步成功！`)
    } catch (e) {
      console.error(`\n${k}同步失败！`)
      console.error(e)
    }
  }
}
