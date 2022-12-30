import run from './utils/run.ts'

export default async (script: string[]) => {
  if (!script.length) {
    console.error('%cEmpty command', 'color:red; font-weight:bold;')
    return
  }

  if (script[0] === 'dev') {
    const { dev, serve, start } = JSON.parse(Deno.readTextFileSync('./package.json')).scripts
    if (dev) {
      await run(['npm run dev'])
    } else if (serve) {
      await run(['npm run serve'])
    } else if (start) {
      await run(['npm run start'])
    } else {
      console.error('%cMissing script: "dev", "serve" or "start"', 'color:red; font-weight:bold;')
    }
  } else {
    await run(['npm', 'run', ...script])
  }
}
