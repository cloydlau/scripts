import run from './utils/run.ts'
import { Input, Select, Confirm } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts"
import * as semver from "https://deno.land/x/semver/mod.ts"
import { ReleaseType, Options } from 'https://deno.land/x/semver/mod.ts'

type OptionsType = {
  name: string,
  value: string,
}[]

export default async () => {
  await run([`cl commit release v0.7.0`])
  return

  const pkg = JSON.parse(Deno.readTextFileSync('./package.json'))
  const { version: currentVersion, name } = pkg

  const releaseOptions: OptionsType = Array.from(['patch', 'minor', 'major'] as ReleaseType[],
    name => ({ name, value: semver.inc(currentVersion, name) as string })),
    prereleaseOptions: OptionsType = Array.from(['prerelease'],
      name => ({ name, value: name })),
    options = releaseOptions.concat(prereleaseOptions)
      .concat([{ name: 'custom', value: 'custom' }]),
    prereleaseType: OptionsType = Array.from(['alpha', 'beta', 'rc'], name => ({ name, value: semver.inc(currentVersion, "prerelease", name as Options) as string }))

  const t = await Select.prompt({
    message: 'Select release type',
    options,
  })

  const targetVersion = t === 'prerelease'
    ? await Select.prompt({
      message: 'Select prerelease type',
      options: prereleaseType,
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
    message: `Releasing v${targetVersion}. Confirm?`
  })

  if (!yes) {
    return
  }

  pkg.version = targetVersion
  Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))

  try {
    console.log('\nPublishing...')
    await run(['npm publish --access=public'])
    console.log(`\n%cSuccessfully published ${name}@${targetVersion}`, 'color:green;font-weight:bold')
  } catch (e) {
    // 恢复版本号
    pkg.version = currentVersion
    Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))

    if (e.stderr.match(/previously published/)) {
      console.log(`\n%cSkipping already published: ${name}`, 'color:red;font-weight:bold')
    } else {
      throw e
    }
  }

  await run([`cl commit "release" v${targetVersion}`])
  await run([`git tag v${targetVersion}`])
  await run([`git push origin refs/tags/v${targetVersion}`])

  console.log('\nSyncing to cnpm...')
  await run([`cnpm sync ${name}`])
}
