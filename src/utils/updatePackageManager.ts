import run from './run.ts'

export default async (packageManager: string) => {
  console.log(`\n%cChecking ${packageManager} version...`, 'color:#409EFF; font-weight:bold;')
  const currentVersion = await run({ cmd: [`${packageManager} -v`], stdout: 'piped' })
  const latestVersion = await run({ cmd: [`npm view ${packageManager} version`], stdout: 'piped' })

  if (currentVersion === latestVersion) {
    console.log(`%c${packageManager} is up-to-date`, 'color:grey; font-weight:bold;')
  } else {
    console.log(`%cUpdating ${packageManager} version from ${currentVersion} to ${latestVersion}...`, 'color:red; font-weight:bold;')
    const storeDir = await run({ cmd: [`${packageManager} config get store-dir`], stdout: 'piped' })
    await run([`npm i ${packageManager} -g`])

    console.log(`\nSetting ${packageManager} registry to \"npmmirror\"...`)
    await run([`${packageManager} config set registry https://registry.npmmirror.com`])

    console.log(`\nRecovering ${packageManager} store-dir to ${storeDir}...`)
    await run([`${packageManager} config set store-dir ${storeDir}`])
  }
}
