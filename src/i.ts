import { Confirm, Select } from 'https://deno.land/x/cliffy@v0.25.6/prompt/mod.ts'
import run from './utils/run.ts'
import benchmark from './benchmark.ts'
import updatePackageManager from './utils/updatePackageManager.ts'

const options = {
  packageManager: [
    { name: 'cnpm', value: 'cnpm' },
    { name: 'yarn', value: 'yarn' },
    { name: 'npm', value: 'npm' },
  ],
  lockFile: {
    'pnpm': '.\\pnpm-lock.yaml',
    'cnpm': '.\\package-lock.json',
    'yarn': '.\\yarn.lock',
    'npm': '.\\package-lock.json',
  },
}

export default async () => {
  // 'node -v' output in Node 14 has a 'Using Node ' prefix
  const nodeVersion = (await run({ cmd: ['node -v'], stdout: 'piped' })).replace('Using Node ', '').replace('v', '')
  const supportPNPM = Number(nodeVersion.split('.')[0]) >= 14
  if (supportPNPM) {
    options.packageManager.unshift({ name: 'pnpm', value: 'pnpm' })
  }

  const packageManager = await Select.prompt({
    message: 'Choose a package manager',
    options: options.packageManager,
  })

  const isFresh = await Confirm.prompt({
    message: 'Remove node_modules & Lockfile before installing',
  })

  if (isFresh) {
    console.log(`%cRemoving ${options.lockFile[packageManager]}...\n`, 'color:red; font-weight:bold;')
    // Lockfile may not exist
    await run([`Remove-Item ${options.lockFile[packageManager]} -ErrorAction Ignore`]).catch(_reason => { })

    console.log('%cRemoving .\\node_modules...\n', 'color:red; font-weight:bold;')
    try {
      await benchmark(['rimraf .\\node_modules'])
    } catch (_e) {
      try {
        console.log('%cChecking if \'rimraf\' is installed...', 'color:#409EFF; font-weight:bold;')
        await run(['npm list --depth 0 --global rimraf'])
      } catch (_e) {
        console.log('%cInstalling rimraf...', 'color:#409EFF; font-weight:bold;')
        await run(['npm i rimraf -g'])
        await benchmark(['rimraf .\\node_modules'])
      }
    }
  }

  if (packageManager !== 'npm') {
    await updatePackageManager(packageManager)
  }

  try {
    await benchmark([`${packageManager} install`])
  } catch (_e) {
    if (packageManager !== 'npm') {
      try {
        console.log(`%cChecking if ${packageManager} is installed...`, 'color:#409EFF; font-weight:bold;')
        await run([`npm list --depth 0 --global ${packageManager}`])
      } catch (_e) {
        console.log(`%cInstalling ${packageManager}...`, 'color:#409EFF; font-weight:bold;')
        await run([`npm i ${packageManager} -g`])
        if (packageManager !== 'cnpm') {
          const npmRegistry = await run({ cmd: ['npm config get registry'], stdout: 'piped' })
          await run([`${packageManager} config set registry ${npmRegistry}`])
        }
        await run([`${packageManager} config set store-dir D:\.${packageManager}-store`])
        await benchmark([`${packageManager} install`])
      }
    }
  }
}
