import run from './utils/run.ts'
import updatePackageManager from './utils/updatePackageManager.ts'

async function updateVersion(this: {
  [key: string]: string
}, include: string[]) {
  const updatedList: string[] = []
  for (const pkgName of include) {
    const latestVersion = await run({ cmd: [`npm view ${pkgName} version`], stdout: 'piped' }) as string
    if (this[pkgName]) {
      if (this[pkgName] === latestVersion) {
        console.log(`%c${pkgName} is up-to-date`, 'color:grey; font-weight:bold;')
      } else {
        console.log(`%c${pkgName} is updated from ${this[pkgName]} to ${latestVersion}`, 'color:red; font-weight:bold;')
        this[pkgName] = latestVersion
        updatedList.push(pkgName)
      }
    }
  }

  return updatedList
}

export default async (include: string[]) => {
  // 如果 Node 在当前主版本号内有更新，则升级
  /* const npmRegistry = await run({ cmd: ['npm config get registry'], stdout: 'piped' })
  const currentNodeVersion = await run({ cmd: ['node -v'], stdout: 'piped' })
  const currentNodeMajorVersion = currentNodeVersion.match(/v\d+(?=\.)/)
  const ltsNodeVersion = (await run({ cmd: ['fnm install --lts'], stdout: 'piped' })).match(/\bv\d+\.\d+\.\d+\b/)[0]
  const ltsNodeMajorVersion = ltsNodeVersion.match(/v\d+(?=\.)/)

  if (currentNodeVersion !== ltsNodeVersion && currentNodeMajorVersion === ltsNodeMajorVersion) {
    await run(['npm add pnpm cnpm -g'])
    await run([`pnpm config set registry ${npmRegistry}`])
  } */

  if (await run({ cmd: ['git diff'], stdout: 'piped' })) {
    console.error('%cYou have uncommitted changes.', 'color:red; font-weight:bold;')
    return
  }

  console.log('\n%cUpgrading Deno...', 'color:#409EFF; font-weight:bold;')
  await run(['deno upgrade'])

  let pkg
  try {
    pkg = JSON.parse(Deno.readTextFileSync('./package.json'))
  } catch (_e) {
    console.error('%cCan not find ./package.json', 'color:red; font-weight:bold;')
  }

  const isPackageManagerVersionInPackageJSONUpdated = await updatePackageManager('pnpm', pkg)

  if (include.length) {
    if (!pkg) {
      return
    }

    console.log('\n%cChecking dependencies...', 'color:#409EFF; font-weight:bold;')
    const updatedDependencies = await updateVersion.call(pkg.dependencies, include)
    console.log('\n%cChecking devDependencies...', 'color:#409EFF; font-weight:bold;')
    const updatedDevDependencies = await updateVersion.call(pkg.devDependencies, include)

    const updatedList = [...updatedDependencies, ...updatedDevDependencies]
    if (isPackageManagerVersionInPackageJSONUpdated) {
      updatedList.unshift('pnpm')
    }

    if (updatedList.length) {
      Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))
      await run(['cl', 'push', '"chore(deps)"', `update ${updatedList.join(', ')}`])
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
    if (isPackageManagerVersionInPackageJSONUpdated) {
      Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))
    }

    await run(['pnpm upgrade'])
    await run(['cl', 'push', '"chore(deps)"', 'update dependencies'])
  }
}
