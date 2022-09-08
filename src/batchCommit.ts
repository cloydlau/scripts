import run from './utils/run.ts'

export default async (message) => {
  const subDirs = Deno.readDirSync('.')
  const realPath = Deno.realPathSync('.')

  for (const dir of subDirs) {
    const cwd = `${realPath}\\${dir.name}`

    console.log('\nCommitting changes...')
    await run('git add -A', { cwd })

    // working tree clean 会报错
    try {
      await run(null, { cmd: ['git', 'commit', '-m', message], cwd })

      console.log('\nPushing to GitHub...')
      await run(`git push`, { cwd })
    } catch (error) {

    }
  }
}
