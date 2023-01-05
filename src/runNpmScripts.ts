import run from './utils/run.ts'

export default async (script: string[], options: Record<string, unknown>) => {
  if (!script.length) {
    console.error('%cEmpty command', 'color:red; font-weight:bold;')
    return
  }

  const optionList: string[] = []
  for (const k in options) {
    if (k !== '--') {
      optionList.push(`--${k}`)
      if (options[k] !== true) {
        optionList.push(`${options[k]}`)
      }
    }
  }

  if (script[0] === 'dev') {
    const { dev, serve, start } = JSON.parse(Deno.readTextFileSync('./package.json')).scripts
    if (dev) {
      await run(['npm', 'run', 'dev', ...optionList])
    } else if (serve) {
      await run(['npm', 'run', 'serve', ...optionList])
    } else if (start) {
      await run(['npm', 'run', 'start', ...optionList])
    } else {
      console.error('%cMissing script: "dev", "serve" or "start"', 'color:red; font-weight:bold;')
    }
  } else {
    await run(['npm', 'run', ...script, ...optionList])
  }
}
