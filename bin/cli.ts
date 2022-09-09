#!/usr/bin/env deno run --allow-all --unstable

import { cac } from 'https://unpkg.com/cac/mod.ts'
const cli = cac('cl')

import clean from '../src/clean.ts'
cli
  .command('clean', `Remove node_modules
  `)
  .action(() => {
    clean()
  })

import release from '../src/release.ts'
cli
  .command('release', `Publish new version
    `)
  .action(() => {
    release()
  })

import npmmirror from '../src/npmmirror.ts'
cli
  .command('npmmirror', `Set or unset registry of npm, yarn & pnpm to npmmirror
  `)
  .action(() => {
    npmmirror()
  })

import verifyCommit from '../src/verifyCommit.ts'
cli
  .command('verifyCommit', `Verify commit message
  `)
  .action(() => {
    verifyCommit()
  })

import benchmark from '../src/benchmark.ts'
cli
  .command('benchmark <...cmd>', `Command benchmark
    # Example
      cl benchmark pnpm i
  `)
  .action((cmd: string[]) => {
    benchmark(cmd)
  })

import up from '../src/up.ts'
cli
  .command('up [...include]', `Upgrade dependencies
    # Example
      cl up
      cl up axios sass vite
  `)
  .action((include: string[]) => {
    up(include)
  })

import push from '../src/push.ts'
cli
  .command('push [type] [...subject]', `'git add' + 'git commit' + 'git push'
    # Example
      cl push docs fix typo
      cl push "chore(deps)!" "update all dependencies"
  `)
  .action((type = 'wip', subject: string[]) => {
    push(type, subject.length ? subject : [type === 'wip' ? 'stash' : 'polish'])
  })

import sow from '../src/sow.ts'
cli
  .command('sow <...cmd>', `Run commands in all current subdirectories
    # Example
      cl sow pnpm i
      cl sow cl up
      cl sow "git switch dev && git fetch up && git merge up/dev"
  `)
  .option('--all', `Whether to check all`)
  .action((cmd: string[], { all = false }) => {
    sow(cmd, all)
  })

import switchVue from '../src/switchVue.ts'
import type { VueVersion } from '../src/switchVue.ts'
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
