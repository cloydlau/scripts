import run from './utils/run.ts'

export default async (options) => {
  console.log(`%cRemoving ./node_modules...`, 'color:red;font-weight:bold')
  const startTime = performance.now()
  await run('rd /s /q .\\node_modules')
  const cost = ((performance.now() - startTime) / 1000).toFixed(2)
  console.log(`%cDone in ${cost}s.\n`, 'color:green;font-weight:bold')
}
