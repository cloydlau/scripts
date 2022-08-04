#!/usr/bin/env deno run --allow-all

import { cac } from 'https://unpkg.com/cac/mod.ts'
const cli = cac('cl')

import clean from '../src/clean.ts'
cli
  .command('clean [root]', 'remove node_modules')
  .action((root: string, options) => {
    try {
      clean(options)
    } catch (error) {
      Deno.exit(1)
    }
  })

import ri from '../src/ri.ts'
cli
  .command('ri [root]', 'remove node_modules and reinstall with pnpm')
  .action((root: string, options) => {
    try {
      ri(options)
    } catch (error) {
      Deno.exit(1)
    }
  })

import upgrade from '../src/upgrade.ts'
cli
  .command('upgrade [root]', 'upgrade dependencies')
  .alias('u')
  .option('--lock', `[boolean] lock version`)
  .option('--include <dependency>', `[string] update list`)
  .action((root: string, options) => {
    try {
      upgrade(options)
    } catch (error) {
      Deno.exit(1)
    }
  })

import switchVue from '../src/switchVue.ts'
cli
  .command('switchVue <version>', '[number] switch vue version')
  .action((version: string) => {
    try {
      switchVue({ version })
    } catch (error) {
      Deno.exit(1)
    }
  })

import verifyCommit from '../src/verifyCommit.ts'
cli
  .command('verifyCommit', '校验 commit message')
  .action((options) => {
    try {
      verifyCommit()
    } catch (error) {
      Deno.exit(1)
    }
  })

import syncFork from '../src/syncFork.ts'
cli
  .command('syncFork <dir>', '[string] 同步下游')
  .action((dir) => {
    try {
      syncFork({ dir })
    } catch (error) {
      Deno.exit(1)
    }
  })

import release from '../src/release.ts'
cli
  .command('release', '发版')
  .action((options) => {
    try {
      release()
    } catch (error) {
      Deno.exit(1)
    }
  })

cli.help()
cli.parse()
