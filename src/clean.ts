import run from '../utils/run.ts'

export default async (options) => {
  console.log(`%cRemoving ./node_modules`, 'color:red;font-weight:bold')
  await run('rd /s /q .\\node_modules')
  console.log(`%cDone!\n`, 'color:green;font-weight:bold')
}
