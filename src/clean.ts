import run from '../utils/run.ts'

export default async (options) => {
  console.log(`%cRemoving ./node_modules`, 'color:red;font-weight:bold')
  await run('rd /s /q .\\node_modules')
  console.log(`%c./node_modules is removed\n`, 'color:green;font-weight:bold')
}
