#!/usr/bin/env deno run --allow-all --unstable

import { cac } from 'https://unpkg.com/cac/mod.ts'
import reinstall from '../src/reinstall.ts'
import release from '../src/release.ts'
import verifyCommit from '../src/verifyCommit.ts'
import benchmark from '../src/benchmark.ts'
import up from '../src/up.ts'
import push from '../src/push.ts'
import sow from '../src/sow.ts'
import switchVue from '../src/switchVue.ts'
import type { VueVersion } from '../src/switchVue.ts'

const cli = cac('cl')
cli
  .command('reinstall', 'Run a fresh install after removing node_modules and lock files\n')
  .action(() => {
    reinstall()
  })
cli
  .command('release', 'Publish new version\n')
  .action(() => {
    release()
  })
cli
  .command('verifyCommit', 'Verify commit message\n')
  .action(() => {
    verifyCommit()
  })
cli
  .command('benchmark <...cmd>', `Command benchmark
    # Example
      cl benchmark pnpm i
  `)
  .action((cmd: string[]) => {
    benchmark(cmd)
  })
cli
  .command('up [...include]', `Upgrade dependencies
    # Example
      cl up
      cl up axios sass vite
  `)
  .action((include: string[]) => {
    up(include)
  })
cli
  .command('push [type] [...subject]', `'git add' + 'git commit' + 'git push'
    # Example
      cl push docs fix typo
      cl push "chore(deps)!" "update all dependencies"
  `)
  .action((type = 'wip', subject: string[]) => {
    push(type, subject.length ? subject : [type === 'wip' ? 'stash' : 'negligible'])
  })
cli
  .command('sow <...cmd>', `Run commands in all current subdirectories
    # Example
      cl sow pnpm i
      cl sow cl up
      cl sow "git switch dev && git fetch up && git merge up/dev"
  `)
  .action((cmd: string[]) => {
    sow(cmd)
  })
cli
  .command('switchVue [version]', `Switch vue version to 2.6 / 2.7 / 3
    # Example
      cl switchVue
      cl switchVue 2.7
    # Config file: ./switchVue.config.json
      {
        "2": {
          "vue-router": "3",
          "element-ui": "latest"
        },
        "3": {
          "vue-router": "latest",
          "element-plus": "latest",
        }
      }
  `)
  .action((version?: VueVersion) => {
    switchVue(version)
  })

cli.help()
cli.parse()
