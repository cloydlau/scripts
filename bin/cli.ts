#!/usr/bin/env deno run --allow-all

const cwd = Deno.cwd()
const config = JSON.parse(Deno.readTextFileSync(cwd + '\\cl.config.ts'))

import { cac } from 'https://unpkg.com/cac/mod.ts'
const cli = cac('cl')

import syncFork from '../src/syncFork.ts'
import verifyCommit from '../src/verifyCommit.ts'
import release from '../src/release.ts'

import upgrade from '../src/upgrade.ts'
cli
  .command('upgrade [root]', 'upgrade dependencies')
  .alias('u')
  .option('--lock', `[boolean] lock version`)
  .action((root: string, options) => {
    upgrade(options)
    console.log(123, root, options)
  })

import switchVue from '../src/switchVue.ts'
cli
  .command('switchVue [root]', 'switch vue version')
  .option('--version <version>', `[number] specify version`)
  .action((root: string, options) => {
    console.log(config.switchVue)
    switchVue({ deps: config.switchVue, ...options })
  })

cli.help()
cli.parse()
