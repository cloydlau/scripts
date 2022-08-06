import run from '../utils/run.ts'

export default async (options) => {
  await run({ cmd: 'rd /s /q .\\node_modules' })
  console.log(`\n%c./node_modules removed!\n`, 'color:green;font-weight:bold')
}
