/**
 * 更新依赖
 */

import run from '../utils/run.ts'

export default async ({ lock = false, include }) => {
  console.log('\nChecking pnpm version...')
  const curVersion = await run({ cmd: 'pnpm -v', stdout: 'piped' })
  const latestVersion = await run({ cmd: 'npm view pnpm version', stdout: 'piped' })

  if (curVersion.stdout !== latestVersion.stdout) {
    console.log(`\n%cFound new pnpm version ${latestVersion.stdout}, updating...`, 'color:red;font-weight:bold')
    await run({ cmd: 'npm add pnpm -g', })

    console.log('\nSetting pnpm registry...')
    await run({ cmd: 'pnpm config set registry https://registry.npmmirror.com' })
  }

  if (lock) {
    async function updateVersion(include) {
      if (include) {
        include = include.split('|')
      } else {
        include = Object.keys(this)
      }

      let updated = false
      for (const pkgName of include) {
        const latestVersion = await run({ cmd: `npm view ${pkgName} version`, stdout: 'piped' })
        if (this[pkgName]) {
          if (['latest', '*'].includes(this[pkgName]) && this[pkgName] !== latestVersion) {
            console.log(`\n%c${pkgName} 从 ${this[pkgName]} 更新至 ${latestVersion}`, 'color:red;font-weight:bold')
            this[pkgName] = latestVersion
            updated = true
          } else {
            console.log(`\n%c${pkgName} 已是最新版`, 'color:green;font-weight:bold')
          }
        }
      }

      return updated
    }

    const pkg = JSON.parse(Deno.readTextFileSync("./package.json"))

    const dependenciesUpdated = updateVersion.call(pkg.dependencies, include)
    const devDependenciesUpdated = updateVersion.call(pkg.devDependencies, include)

    if (dependenciesUpdated || devDependenciesUpdated) {
      Deno.writeTextFileSync("./package.json", JSON.stringify(pkg, null, 2))
      await run({ cmd: 'pnpm i' })
      await run({ cmd: 'pnpm build:prod' })
      await run({ cmd: 'pnpm dev' })
    }
  } else {
    console.log('\nUpdating dependencies...')
    await run({ cmd: 'pnpm upgrade' })
  }
}
