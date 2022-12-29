import run from './utils/run.ts'

export default async (script: string[]) => {
  if (!script.length) {
    return
  }

  const scripts = JSON.parse(Deno.readTextFileSync('./package.json')).scripts

  if (script[0] === 'dev') {
    if (scripts.dev) {
      await run(['npm run dev'])
    } else if (scripts.serve) {
      await run(['npm run serve'])
    } else if (scripts.start) {
      await run(['npm run start'])
    } else {
      console.error('%cMissing script: "dev", "serve" or "start"', 'color:red; font-weight:bold;')
    }
  } else {
    await run(['npm', 'run', ...script])
  }
}
