import run from './run.ts'

export default async (packageManager: string, pkg?: object): Promise<boolean> => {
  console.log(`\n%cChecking ${packageManager} version...`, 'color:#409EFF; font-weight:bold;')
  const currentVersion = await run({ cmd: [`${packageManager} -v`], stdout: 'piped' })
  const latestVersion = await run({ cmd: [`npm view ${packageManager} version`], stdout: 'piped' })

  if (currentVersion === latestVersion) {
    console.log(`%c${packageManager} is up-to-date`, 'color:grey; font-weight:bold;')
    return false
  } else {
    console.log(`%cUpdating ${packageManager} version from ${currentVersion} to ${latestVersion}...`, 'color:red; font-weight:bold;')
    const registry = await run({ cmd: [`${packageManager} config get registry`], stdout: 'piped' })
    const storeDir = await run({ cmd: [`${packageManager} config get store-dir`], stdout: 'piped' })
    await run([`npm i ${packageManager} -g`])

    console.log(`\nRecovering registry to ${registry}...`)
    await run([`${packageManager} config set registry ${registry}`])

    console.log(`\nRecovering store-dir to ${storeDir}...`)
    await run([`${packageManager} config set store-dir ${storeDir}`])

    let isPackageManagerVersionInPackageJSONUpdated = false
    try {
      pkg ??= JSON.parse(Deno.readTextFileSync('./package.json'))

      if (pkg.packageManager) {
        const [currentPackageManager, currentVersion] = pkg.packageManager.split('@')
        if (currentPackageManager === packageManager && currentVersion !== latestVersion) {
          pkg.packageManager = `${currentPackageManager}@${latestVersion}`
          isPackageManagerVersionInPackageJSONUpdated = true
        }
      }
    } catch (_e) {
      // fix(deno lint): Empty block statement
    }

    return isPackageManagerVersionInPackageJSONUpdated
  }
}
