import run from './utils/run.ts'

export default async (targetVersion: string) => {
  console.log('\n%cSwitching Node...', 'color:#409EFF; font-weight:bold;')
  const currentNodeVersion = await run({ cmd: ['node -v'], stdout: 'piped' })
  const currentGlobalDependencies = JSON.parse(await run({ cmd: ['npm ls -json -g'], stdout: 'piped' })).dependencies

  const targetNodeVersion = (await run({ cmd: [`fnm install ${targetVersion}`], stdout: 'piped' })).match(/\bv\d+\.\d+\.\d+\b/)[0]

  if (currentNodeVersion !== targetNodeVersion) {
    const npmRegistry = currentNodeVersion
      ? await run({ cmd: ['npm config get registry'], stdout: 'piped' })
      : 'https://registry.npmmirror.com'
    await run(['fnm default lts-latest'])
    await run(['fnm use lts-latest'])

    const globalDependencies = new Set(['pnpm', 'cnpm', 'rimraf'])
    for (const k in currentGlobalDependencies) {
      if (!['npm', 'corepack'].includes(k)) {
        // link 的依赖
        if (currentGlobalDependencies[k].resolved) {
          // resolved 以 file: 开头
          await run({ cmd: ['npm link'], cwd: currentGlobalDependencies[k].resolved.substring(5) })
        } else {
          globalDependencies.add(k)
        }
      }
    }

    await run([`npm add -g ${[...globalDependencies].join(' ')}`])
    await run([`pnpm config set registry ${npmRegistry}`])
  }
}
