import run from './utils/run.ts'

export default async (include: string) => {
  console.log('\nChecking pnpm version...')
  const curVersion = await run('pnpm -v', { stdout: 'piped' })
  const latestVersion = await run('npm view pnpm version', { stdout: 'piped' })

  if (curVersion === latestVersion) {
    console.log('pnpm is up-to-date')
  } else {
    console.log(`\n%cUpdating pnpm version from ${curVersion} to ${latestVersion}...`, 'color:red;font-weight:bold')
    const storeDir = await run('pnpm config get store-dir', { stdout: 'piped' })
    await run('npm add pnpm -g')

    console.log('\nSetting pnpm registry to \"npmmirror\"...')
    await run('pnpm config set registry https://registry.npmmirror.com')

    console.log(`\nRecovering pnpm store-dir to ${storeDir}`)
    await run(`pnpm config set store-dir ${storeDir}`)
  }

  if (include) {
    async function updateVersion(include) {
      if (include) {
        include = include.split(',')
      } else {
        include = Object.keys(this)
      }

      let updated = false
      for (const pkgName of include) {
        const latestVersion = await run(`npm view ${pkgName} version`, { stdout: 'piped' })
        if (this[pkgName]) {
          if (this[pkgName] === latestVersion) {
            console.log(`${pkgName} is up-to-date`)
          } else {
            console.log(`%c${pkgName} is updated from ${this[pkgName]} to ${latestVersion}`, 'color:red;font-weight:bold')
            this[pkgName] = latestVersion
            updated = true
          }
        }
      }

      return updated
    }

    const pkg = JSON.parse(Deno.readTextFileSync("./package.json"))

    console.log('\nChecking dependencies...')
    const dependenciesUpdated = await updateVersion.call(pkg.dependencies, include)
    console.log('\nChecking devDependencies...')
    const devDependenciesUpdated = await updateVersion.call(pkg.devDependencies, include)

    if (dependenciesUpdated || devDependenciesUpdated) {
      Deno.writeTextFileSync("./package.json", JSON.stringify(pkg, null, 2))

      console.log('\nCommitting changes...')
      await run('git add -A')
      await run(null, { cmd: ['git', 'commit', '-m', 'chore(deps): update specified dependencies'] })

      console.log('\nPushing')
      await run(`git push`)

      try {
        console.log('\n')
        await run('pnpm i')
      } catch (e) {
        // 可能会有 Unmet peer dependencies 的报错，不影响
      }
    } else {
      console.log(`\n%cAll specified dependencies are up-to-date`, 'color:green;font-weight:bold')
    }
  } else {
    console.log('\nUpdating dependencies...')
    await run('pnpm upgrade')
  }
}
