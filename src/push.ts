import run from './utils/run.ts'

export default async (type: string, subject = ['polish']) => {
  console.log('\nCommitting changes...')
  await run(['git add -A'])
  // working tree clean 会报错
  await run(['git', 'commit', '-m', `${type}: ${subject.join(' ')}`])
  console.log('\nPushing...')
  await run(['git push'])
}
