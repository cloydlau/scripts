import run from './utils/run.ts'
import { Confirm } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts"

const packageManagers = ['pnpm', 'yarn', 'npm']
const npmmirror = 'https://registry.npmmirror.com'

export default async () => {
  const yes = await Confirm.prompt({
    type: 'Confirm',
    message: `Set registry to npmmirror?`,
  })
  if (yes) {
    await Promise.allSettled(Array.from(packageManagers, packageManager =>
      run(`${packageManager} config set registry ${npmmirror}`)))
    await Promise.allSettled(Array.from(packageManagers, packageManager =>
      run(`${packageManager} config get registry`, { stdout: 'piped' }).then((registry) => {
        console.log(`%c${packageManager} registry has been set to: ${registry}`, 'color:green;font-weight:bold')
      })))
  } else {
    await Promise.allSettled(Array.from(packageManagers, packageManager =>
      run(`${packageManager} config delete registry`)))
    await Promise.allSettled(Array.from(packageManagers, packageManager =>
      run(`${packageManager} config get registry`, { stdout: 'piped' }).then((registry) => {
        console.log(`${packageManager} registry has been reset to: ${registry}`)
      })))
  }
}
