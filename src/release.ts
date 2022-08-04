/**
 * 发版
 * - pnpm add chalk@^4.1.2 enquirer execa@^4.1.0 minimist semver -D: 需要安装的依赖
 * - "release": "node scripts/release.js": package.json - scripts
 * - pnpm release: 打包 + 发布 + Push + Tag
 */


import parseArgs from 'https://deno.land/x/deno_minimist@v1.0.2/mod.ts'
import Prompt from 'https://deno.land/x/prompt@v1.0.0/mod.ts'
import run from '../utils/run.ts'

const args = require('minimist')(process.argv.slice(2))
const fs = require('fs')
const path = require('path')

const semver = require('semver')
const currentVersion = require('../package.json').version
const pkg = require('../package.json').name

const preId =
  args.preid ||
  (semver.prerelease(currentVersion) && semver.prerelease(currentVersion)[0])
const isDryRun = args.dry
const straightforward = args.straightforward

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : [])
]

const inc = i => semver.inc(currentVersion, i, preId)

async function main() {
  let targetVersion = args._[0]

  if (straightforward) {
    targetVersion = currentVersion
  } else {
    if (!targetVersion) {
      const { release } = await Prompt.prompts([{
        type: 'select',
        name: 'release',
        message: 'Select release type',
        choices: versionIncrements.map(i => `${i} (${inc(i)})`).concat(['custom'])
      }])

      if (release === 'custom') {
        targetVersion = (
          await Prompt.prompts([{
            type: 'input',
            name: 'version',
            message: 'Input custom version',
            initial: currentVersion
          }])
        ).version
      } else {
        targetVersion = release.match(/\((.*)\)/)[1]
      }
    }

    if (!semver.valid(targetVersion)) {
      throw new Error(`invalid target version: ${targetVersion}`)
    }

    const { yes } = await Prompt.prompts([{
      type: 'confirm',
      name: 'yes',
      message: `Releasing v${targetVersion}. Confirm?`
    }])

    if (!yes) {
      return
    }

    console.log('\nUpdating version...')
    updateVersions(targetVersion)

    console.log('\nBuilding...')
    if (!isDryRun) {
      await run('pnpm run build')
    } else {
      console.log(`(skipped)`)
    }
  }

  console.log('\nPublishing...')
  await publishPackage(pkg, targetVersion, run)

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

  if (isDryRun) {
    console.log(`\nDry run finished - run git diff to see package changes.`)
  }
}

function updateVersions(version) {
  updatePackage(path.resolve(__dirname, '..'), version)
}

function updatePackage(pkgRoot, version) {
  const pkgPath = path.resolve(pkgRoot, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

async function publishPackage(pkgName, version, run) {
  const releaseTag = semver.prerelease(version) && semver.prerelease(version)[0] || null

  console.log(`Publishing ${pkgName}...`)
  await run('npm config delete registry')
  try {
    await run('npm publish')
    console.log(`\n%cSuccessfully published ${pkgName}@${version}`, 'color:green;font-weight:bold')
  } catch (e) {
    if (e.stderr.match(/previously published/)) {
      console.log(`\n%cSkipping already published: ${pkgName}`, 'color:red;font-weight:bold')
    } else {
      throw e
    }
  }
  await run('pnpm config set registry https://registry.npmmirror.com')

  run(`cnpm sync ${pkgName}`)
  run(`explorer https://npmmirror.com/sync/${pkgName}`)
}

main().catch(e => {
  console.error(e)
})
