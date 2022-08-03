/**
 * 更新依赖
 */
import run from './run'

export default async ({ lock = false }) => {
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
    function updateVersion(list = Object.keys(this)) {
      let updated = false
      for (const pkgName of list) {
        const latestVersion = await run({ cmd: `npm view ${pkgName} version`, stdout: 'piped' })
        if (['latest', '*'].includes(this[pkgName]) && this[pkgName] !== latestVersion) {
          console.log(`\n%c${pkgName} 从 ${this[pkgName]} 更新至 ${latestVersion}`, 'color:red;font-weight:bold')
          this[pkgName] = latestVersion
          updated = true
        } else {
          console.log(`\n${pkgName} 已是最新版`)
        }
      }
      return updated
    }

    const pkg = JSON.parse(Deno.readTextFileSync("./package.json"))

    const dependenciesUpdated = updateVersion.call(pkg.dependencies, list)
    const devDependenciesUpdated = updateVersion.call(pkg.devDependencies, list)

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
