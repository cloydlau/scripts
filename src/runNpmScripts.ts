import run from './utils/run.ts'
import benchmark from './benchmark.ts'

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

    let key, value

    if (dev) {
      key = 'dev'
      value = dev
    } else if (serve) {
      key = 'serve'
      value = serve
    } else if (start) {
      key = 'start'
      value = start
    }

    if (key) {
      // delete the cache files when starting a vite dev server with '--force' (to make sure it works)
      if ((value === 'vite' || value.startsWith('vite ')) && optionList.includes('--force')) {
        console.log(`%cRemoving .\\node_modules\\.vite...\n`, 'color:red; font-weight:bold;')
        try {
          await benchmark(['rimraf .\\node_modules\\.vite'])
        } catch (_e) {
          try {
            console.log('%cChecking if \'rimraf\' is installed...', 'color:#409EFF; font-weight:bold;')
            await run(['npm list --depth 0 --global rimraf'])
          } catch (_e) {
            console.log('%cInstalling rimraf...', 'color:#409EFF; font-weight:bold;')
            await run(['npm i rimraf -g'])
            await benchmark(['rimraf .\\node_modules\\.vite'])
          }
        }
      }
      await run(['npm', 'run', key, ...optionList])
    } else {
      console.error('%cMissing script: "dev", "serve" or "start"', 'color:red; font-weight:bold;')
    }
  } else {
    await run(['npm', 'run', ...script, ...optionList])
  }
}
