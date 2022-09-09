import run from './utils/run.ts'

async function updateVersion(this: {
  [key: string]: string
}, include: string[]) {
  let updated = false
  for (const pkgName of include) {
    const latestVersion = await run({ cmd: [`npm view ${pkgName} version`], stdout: 'piped' }) as string
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

export default async (include: string[]) => {
  console.log('\nChecking pnpm version...')
  const curVersion = await run({ cmd: ['pnpm -v'], stdout: 'piped' })
  const latestVersion = await run({ cmd: ['npm view pnpm version'], stdout: 'piped' })

  if (curVersion === latestVersion) {
    console.log('pnpm is up-to-date')
  } else {
    console.log(`\n%cUpdating pnpm version from ${curVersion} to ${latestVersion}...`, 'color:red;font-weight:bold')
    const storeDir = await run({ cmd: ['pnpm config get store-dir'], stdout: 'piped' })
    await run(['npm add pnpm -g'])

    console.log('\nSetting pnpm registry to \"npmmirror\"...')
    await run(['pnpm config set registry https://registry.npmmirror.com'])

    console.log(`\nRecovering pnpm store-dir to ${storeDir}`)
    await run([`pnpm config set store-dir ${storeDir}`])
  }

  if (include.length) {
    let pkgText
    try {
      pkgText = Deno.readTextFileSync('./package.json')
    } catch (_e) {
      console.error('%cCan not find ./package.json', 'color:red;font-weight:bold')
      return
    }

    const pkg = JSON.parse(pkgText)

    console.log('\nChecking dependencies...')
    const dependenciesUpdated = await updateVersion.call(pkg.dependencies, include)
    console.log('\nChecking devDependencies...')
    const devDependenciesUpdated = await updateVersion.call(pkg.devDependencies, include)

    if (dependenciesUpdated || devDependenciesUpdated) {
      Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))
      await run(['cl', 'push', 'chore(deps)', 'update specified dependencies'])
      try {
        console.log('\n')
        await run(['pnpm i'])
      } catch (_e) {
        // 可能会有 Unmet peer dependencies 的报错
      }
    } else {
      console.log('\n%cAll specified dependencies are up-to-date', 'color:green;font-weight:bold')
    }
  } else {
    console.log('\nUpdating dependencies...')
    await run(['pnpm upgrade'])
  }
}
