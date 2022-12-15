import { Confirm, Select } from 'https://deno.land/x/cliffy@v0.25.4/prompt/mod.ts'
import benchmark from './benchmark.ts'
import run from './utils/run.ts'

const options = {
  packageManager: [
    { name: 'pnpm', value: 'pnpm i' },
    { name: 'cnpm', value: 'cnpm i' },
    { name: 'yarn', value: 'yarn' },
    { name: 'npm', value: 'npm i' },
    { name: 'Don\'t install', value: 'nah' },
  ],
  lockFile: [
    { name: 'pnpm', value: '.\\pnpm-lock.yaml' },
    { name: 'yarn', value: '.\\yarn.lock' },
    { name: 'npm', value: '.\\package-lock.json' },
  ],
}

export default async () => {
  const cmd = await Select.prompt({
    message: 'Choose a package manager to install after ./node_modules removed',
    options: options.packageManager,
    hint: 'Press \'u\' for up and \'d\' for down.',
  })

  if (await Confirm.prompt({
    message: 'Remove lock files before installing',
  })) {
    for (const { value } of options.lockFile) {
      console.log(`%cRemoving ${value}...`, 'color:red; font-weight:bold;')
      try {
        await run(['Remove-Item', value])
      } catch (e) {
        if (e) {
          console.error(e)
        }
      }
    }
  }

  console.log('%cRemoving .\\node_modules...', 'color:red; font-weight:bold;')
  await benchmark(['Remove-Item', '.\\node_modules', '-Recurse'])
  if (cmd !== 'nah') {
    await run([cmd])
  }
}
