import run from './utils/run.ts'

export default async (type: string, subject: string[]) => {
  const m = `"${type}: ${subject.join(' ')}"`
  console.log(`\n%cCommitting ${m}...`, 'color:#409EFF; font-weight:bold;')
  await run(['git add -A'])
  // working tree clean 会报错
  await run(['git', 'commit', '-m', m])
  console.log('\n%cPushing...', 'color:#409EFF; font-weight:bold;')
  await run(['git push'])
}
