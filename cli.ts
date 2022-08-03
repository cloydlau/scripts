import { cac } from 'cac'

const cli = cac('cl')

// upgrade
cli
  .command('upgrade [root]', 'upgrade dependencies') // default command
  .alias('u')
  .option('--lock', `[boolean] lock version`)
  .action(async (root: string, options: ServerOptions & GlobalCLIOptions) => {
    try {

    } catch (e) {

      process.exit(1)
    }
  })
