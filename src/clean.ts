import benchmark from './benchmark.ts'

export default async () => {
  console.log(`%cRemoving ./node_modules...`, 'color:red;font-weight:bold')
  await benchmark(['rd', '/s', '/q', '.\\node_modules'])
}
