#!/usr/bin/env deno run --allow-all --unstable

import { cac } from 'https://unpkg.com/cac/mod.ts'
const cli = cac('cl')

import clean from '../src/clean.ts'
cli
  .command('clean', 'remove node_modules')
  .action(() => {
    clean()
  })

import up from '../src/up.ts'
cli
  .command('up [include]', '[string] upgrade dependencies')
  .action((include: string, options) => {
    try {
      up(include, options)
    } catch (e) {
      Deno.exit(1)
    }
  })

import switchVue from '../src/switchVue.ts'
cli
  .command('switchVue <version>', '[number] switch vue version')
  .action((version: string) => {
    switchVue(version)
  })

import verifyCommit from '../src/verifyCommit.ts'
cli
  .command('verifyCommit', 'verify commit message')
  .action(() => {
    verifyCommit()
  })

import syncFork from '../src/syncFork.ts'
cli
  .command('syncFork <dir>', '[string] sync fork')
  .option('--base <base>', `[string] directory base`)
  .action((dir, options) => {
    syncFork(Array.from(dir.split('|'), v => {
      const value = (options.base ?? '') + v
      return { name: value, value }
    }))
  })

import release from '../src/release.ts'
cli
  .command('release', 'publish new version')
  .option('--skipBuild', `[boolean] whether to skip build`)
  .action(async (options) => {
    await release(options)
  })

cli.help()
cli.parse()
