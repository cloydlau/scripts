import run from './utils/run.ts'

export default async (type: string, subject = 'polish') => {
  console.log('\nCommitting changes...')
  await run(['git add -A'])

  // working tree clean 会报错
  try {
    await run(['git', 'commit', '-m', `${type}: ${subject}`])

    console.log('\nPushing...')
    await run(['git push'])
  } catch (e) {
    console.error(`\n%c${e}`, 'color:red;font-weight:bold')
  }
}
