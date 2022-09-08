#!/usr/bin/env deno run --allow-all --unstable

import { cac } from 'https://unpkg.com/cac/mod.ts'
const cli = cac('cl')

import batchCommit from '../src/batchCommit.ts'
cli
  .command('batchCommit <message>', 'Batch commit')
  .action((message) => {
    batchCommit(message)
  })

import benchmark from '../src/benchmark.ts'
cli
  .command('benchmark <cmd>', '[string] Command benchmark')
  .action((cmd: string) => {
    benchmark(cmd)
  })

import clean from '../src/clean.ts'
cli
  .command('clean', 'Remove node_modules')
  .action(() => {
    clean()
  })

import up from '../src/up.ts'
cli
  .command('up [include]', '[string] Upgrade dependencies')
  .action((include: string) => {
    try {
      up(include)
    } catch (e) {
      Deno.exit(1)
    }
  })

import npmmirror from '../src/npmmirror.ts'
cli
  .command('npmmirror', 'Set registries of pnpm, yarn, npm to npmmirror')
  .action(() => {
    npmmirror()
  })

import verifyCommit from '../src/verifyCommit.ts'
cli
  .command('verifyCommit', 'Verify commit message')
  .action(() => {
    verifyCommit()
  })

import release from '../src/release.ts'
cli
  .command('release', 'Publish new version')
  .action((options) => {
    release(options)
  })

import switchVue from '../src/switchVue.ts'
cli
  .command('switchVue [version]', '[string] Switch vue version')
  .option('--vue2deps <vue2deps>', `[string] Dependencies of vue2`)
  .option('--vue3deps <vue3deps>', `[string] Dependencies of vue3`)
  .action((version: string, options) => {
    switchVue(version, options)
  })

import syncFork from '../src/syncFork.ts'
cli
  .command('syncFork <dir>', '[string] Synchronize fork')
  .option('--base <base>', `[string] Directory base`)
  .action((dir, options) => {
    syncFork(Array.from(dir.split(','), name => ({ name, value: (options.base ?? '') + name })))
  })

cli.help()
cli.parse()
