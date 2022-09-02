import run from './utils/run.ts'

export default async (cmd) => {
  const startTime = performance.now()
  await run(cmd)
  const cost = ((performance.now() - startTime) / 1000).toFixed(2)
  console.log(`%cCommand "${cmd}" finished in ${cost}s.\n`, 'color:#409EFF;font-weight:bold')
}
