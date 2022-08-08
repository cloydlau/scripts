import parseArgs from 'https://deno.land/x/deno_minimist@v1.0.2/mod.ts'
import { Input, Select, Confirm } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts"
import * as semver from "https://deno.land/x/semver/mod.ts"
import run from '../utils/run.ts'

const args = parseArgs(Deno.args)
const pkg = JSON.parse(Deno.readTextFileSync('./package.json'))
const { version: currentVersion, name } = pkg
const preId =
  args.preid ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : [])
]

const inc = i => semver.inc(currentVersion, i, preId)

export default async ({ skipBuild = false }) => {
  const release = await Select.prompt({
    message: 'Select release type',
    options: versionIncrements.map(name => ({ name, value: inc(name) })).concat([{ name: 'custom', value: 'custom' }]),
  })

  const targetVersion = release === 'custom' ? await Input.prompt({
    message: 'Input custom version',
    initial: currentVersion
  }) : release.match(/\((.*)\)/)[1]

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const yes = await Confirm.prompt({
    message: `Releasing v${targetVersion}. Confirm?`
  })

  if (!yes) {
    return
  }

  pkg.version = targetVersion
  Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))

  if (!skipBuild) {
    console.log('\nBuilding...')
    await run('pnpm build')
  }

  // 会把 pnpm 的 registry 也删掉
  await run('npm config delete registry')
  try {
    console.log('\nPublishing...')
    await run('npm publish')
    console.log(`\n%cSuccessfully published ${name}@${targetVersion}`, 'color:green;font-weight:bold')
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(`\n%cSkipping already published: ${name}`, 'color:red;font-weight:bold')
    } else {
      throw e
    }
  } finally {
    // 会把 npm 的 registry 也设置上
    await run('pnpm config set registry https://registry.npmmirror.com')
  }

  const { stdout } = await run('git diff', { stdout: 'piped' })
  if (stdout) {
    console.log('\nCommitting changes...')
    await run('git add -A')
    await run(`git commit -m release: v${targetVersion}`)
  } else {
    console.log('No changes to commit.')
  }

  console.log('\nPushing to GitHub...')
  await run(`git tag v${targetVersion}`)
  await run(`git push origin refs/tags/v${targetVersion}`)
  await run(`git push`)

  console.log('\nSyncing to cnpm...')
  await run(`cnpm sync ${name}`)
}
