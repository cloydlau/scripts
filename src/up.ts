import run from './utils/run.ts'

async function updateVersion(this: {
  [key: string]: string
}, include: string[]) {
  let updated = false
  for (const pkgName of include) {
    const latestVersion = await run({ cmd: [`npm view ${pkgName} version`], stdout: 'piped' }) as string
    if (this[pkgName]) {
      if (this[pkgName] === latestVersion) {
        console.log(`%c${pkgName} is up-to-date`, 'color:grey; font-weight:bold;')
      } else {
        console.log(`%c${pkgName} is updated from ${this[pkgName]} to ${latestVersion}`, 'color:red; font-weight:bold;')
        this[pkgName] = latestVersion
        updated = true
      }
    }
  }

  return updated
}

export default async (include: string[]) => {
  console.log('\n%cChecking Deno version...', 'color:#409EFF; font-weight:bold;')
  await run(['deno upgrade'])

  console.log('\n%cChecking PNPM version...', 'color:#409EFF; font-weight:bold;')
  const pnpmCurrentVersion = await run({ cmd: ['pnpm -v'], stdout: 'piped' })
  const pnpmLatestVersion = await run({ cmd: ['npm view pnpm version'], stdout: 'piped' })

  if (pnpmCurrentVersion === pnpmLatestVersion) {
    console.log('%cPNPM is up-to-date', 'color:grey; font-weight:bold;')
  } else {
    console.log(`%cUpdating PNPM version from ${pnpmCurrentVersion} to ${pnpmLatestVersion}...`, 'color:red; font-weight:bold;')
    const storeDir = await run({ cmd: ['pnpm config get store-dir'], stdout: 'piped' })
    await run(['npm add pnpm -g'])

    console.log('\nSetting PNPM registry to \"npmmirror\"...')
    await run(['pnpm config set registry https://registry.npmmirror.com'])

    console.log(`\nRecovering PNPM store-dir to ${storeDir}...`)
    await run([`pnpm config set store-dir ${storeDir}`])
  }

  if (include.length) {
    let pkgText
    try {
      pkgText = Deno.readTextFileSync('./package.json')
    } catch (_e) {
      console.error('%cCan not find ./package.json', 'color:red; font-weight:bold;')
      return
    }

    const pkg = JSON.parse(pkgText)

    console.log('\n%cChecking dependencies...', 'color:#409EFF; font-weight:bold;')
    const dependenciesUpdated = await updateVersion.call(pkg.dependencies, include)
    console.log('\n%cChecking devDependencies...', 'color:#409EFF; font-weight:bold;')
    const devDependenciesUpdated = await updateVersion.call(pkg.devDependencies, include)

    if (dependenciesUpdated || devDependenciesUpdated) {
      Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))
      await run(['cl', 'push', '"chore(deps)"', 'update specified dependencies'])
      try {
        console.log('\n')
        await run(['pnpm i'])
      } catch (_e) {
        // 可能会有 Unmet peer dependencies 的报错
      }
    } else {
      console.log('\n%cAll specified dependencies are up-to-date', 'color:green; font-weight:bold;')
    }
  } else {
    await run(['pnpm upgrade'])
  }
}
