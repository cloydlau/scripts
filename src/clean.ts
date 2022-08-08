import run from '../utils/run.ts'

export default async (options) => {
  console.log('\nRemoving ./node_modules')
  await run('rd /s /q .\\node_modules')
  console.log(`%cDone!\n`, 'color:green;font-weight:bold')
}
