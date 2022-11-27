import { Confirm, Input, Select } from 'https://deno.land/x/cliffy@v0.25.4/prompt/mod.ts'
import * as semver from 'https://deno.land/x/semver@v1.4.1/mod.ts'
import type { Options, ReleaseType } from 'https://deno.land/x/semver@v1.4.1/mod.ts'
import run from './utils/run.ts'

type OptionsType = {
  name: string
  value: string
}[]

export default async () => {
  const pkg = JSON.parse(Deno.readTextFileSync('./package.json'))
  const { version: currentVersion, name } = pkg

  const releaseOptions: OptionsType = Array.from(['patch', 'minor', 'major'] as ReleaseType[],
    name => ({ name, value: semver.inc(currentVersion, name) as string }))
  const prereleaseOptions: OptionsType = Array.from(['prerelease'],
    name => ({ name, value: name }))
  const options = releaseOptions.concat(prereleaseOptions)
    .concat([{ name: 'custom', value: 'custom' }])
  const prereleaseType: OptionsType = Array.from(['alpha', 'beta', 'rc'], name => ({ name, value: semver.inc(currentVersion, 'prerelease', name as Options) as string }))

  const t = await Select.prompt({
    message: 'Select release type',
    options,
    hint: 'Press \'u\' for up and \'d\' for down.',
  })

  const targetVersion = t === 'prerelease'
    ? await Select.prompt({
      message: 'Select prerelease type',
      options: prereleaseType,
      hint: 'Press \'u\' for up and \'d\' for down.',
    })
    : t === 'custom'
      ? await Input.prompt({
        message: 'Input custom version',
      })
      : t

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const yes = await Confirm.prompt({
    message: `Releasing v${targetVersion}. Confirm?`,
  })

  if (!yes) {
    return
  }

  pkg.version = targetVersion
  Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))

  try {
    console.log('\n%cPublishing...', 'color:#409EFF; font-weight:bold;')
    await run(['npm publish --access=public'])
    console.log(`\n%cSuccessfully published ${name}@${targetVersion}`, 'color:green; font-weight:bold;')
  } catch (e) {
    // 恢复版本号
    pkg.version = currentVersion
    Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))

    if (e.stderr.match(/previously published/)) {
      console.log(`\n%cSkipping already published: ${name}`, 'color:red; font-weight:bold;')
    } else {
      throw e
    }
  }

  await run([`cl push release v${targetVersion}`])
  await run([`git tag v${targetVersion}`])
  await run([`git push origin refs/tags/v${targetVersion}`])

  console.log('\n%cUpdating \'npmmirror\'...', 'color:#409EFF; font-weight:bold;')
  await run([`cnpm sync ${name}`])
}
