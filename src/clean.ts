/**
 * 删除 node_modules
 */

import run from '../utils/run.ts'

export default async (options) => {
  await run({ cmd: 'rd /s /q .\\node_modules' })
}
