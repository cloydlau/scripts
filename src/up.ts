import run from '../utils/run.ts'

export default async (include: string) => {
  console.log('\nChecking pnpm version...')
  const curVersion = await run('pnpm -v', { stdout: 'piped' })
  const latestVersion = await run('npm view pnpm version', { stdout: 'piped' })

  if (curVersion.stdout === latestVersion.stdout) {
    console.log('pnpm is up-to-date')
  } else {
    console.log(`\n%cFound new pnpm version ${latestVersion.stdout}, updating...`, 'color:red;font-weight:bold')
    await run('npm add pnpm -g')

    console.log('\nSetting pnpm registry...')
    await run('pnpm config set registry https://registry.npmmirror.com')
  }

  if (include) {
    async function updateVersion(include) {
      if (include) {
        include = include.split(',')
      } else {
        include = Object.keys(this)
      }

      console.log('\nChecking dependencies...')
      let updated = false
      for (const pkgName of include) {
        const latestVersion = await run(`npm view ${pkgName} version`, { stdout: 'piped' })
        if (this[pkgName]) {
          let prefix = ''
          if (['^', '~'].includes(this[pkgName][0])) {
            prefix = this[pkgName][0]
            this[pkgName] = this[pkgName].substring(1)
          }
          if (this[pkgName] === latestVersion || ['latest', '*'].includes(this[pkgName])) {
            console.log(`${pkgName} is up-to-date`)
          } else {
            console.log(`\n%c${pkgName} is updated from ${this[pkgName]} to ${latestVersion}`, 'color:red;font-weight:bold')
            this[pkgName] = prefix + latestVersion
            updated = true
          }
        }
      }

      return updated
    }

    const pkg = JSON.parse(Deno.readTextFileSync("./package.json"))

    const dependenciesUpdated = await updateVersion.call(pkg.dependencies, include)
    const devDependenciesUpdated = await updateVersion.call(pkg.devDependencies, include)

    console.log('\n')

    if (dependenciesUpdated || devDependenciesUpdated) {
      Deno.writeTextFileSync("./package.json", JSON.stringify(pkg, null, 2))
      await run('pnpm i')
      await run('pnpm build:prod')
      await run('pnpm dev')
    } else {
      console.log(`\n%cAll dependencies are up-to-date.`, 'color:green;font-weight:bold')
    }
  } else {
    console.log('\nUpdating dependencies...')
    await run('pnpm upgrade')
  }
}
