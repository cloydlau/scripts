/**
 * 删除 node_modules，然后使用 pnpm 重新安装依赖
 */

import run from '../utils/run.ts'

export default async (options) => {
  await run({ cmd: 'cl clean && pnpm i' })
}
