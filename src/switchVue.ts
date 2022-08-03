//import parseArgs from 'https://deno.land/x/deno_minimist@v1.0.2/mod.ts'
import Prompt from 'https://deno.land/x/prompt@v1.0.0/mod.ts'
import { merge } from "https://deno.land/x/lodash_es@v0.0.2/mod.ts"
import run from '../utils/run.ts'

const cwd = Deno.cwd()

//const args = parseArgs(Deno.args)
const pkg = JSON.parse(Deno.readTextFileSync(cwd + '\\package.json'))

//const targetVersion = args._[0]
let currentVersion
if (pkg.devDependencies.vue) {
  if ((
    pkg.devDependencies.vue === '2'
    || pkg.devDependencies.vue.startsWith('2.7')
    || pkg.devDependencies.vue.startsWith('~2.7')
    || pkg.devDependencies.vue.startsWith('^2.7')))
    currentVersion = 2.7
  else if ((
    pkg.devDependencies.vue.startsWith('2.')
    || pkg.devDependencies.vue.startsWith('~2.')
    || pkg.devDependencies.vue.startsWith('^2.')))
    currentVersion = 2
  else {
    currentVersion = 3
  }
}

export default async ({ deps, version: targetVersion }) => {
  if (currentVersion && currentVersion !== targetVersion) {
    const { yes } = await Prompt.prompts([{
      type: 'confirm',
      name: 'yes',
      message: `当前 Vue 版本为 ${currentVersion}, 是否切换至 ${targetVersion}？`,
    }])
    if (!yes)
      return
  }

  const Deps = merge({
    3: {
      '@vitejs/plugin-vue': 'latest',
      '@vue/compiler-sfc': 'latest',
      '@vue/test-utils': 'latest',
      'vue': 'latest',
    },
    2.7: {
      '@vitejs/plugin-vue2': 'latest',
      '@vue/test-utils': '1',
      'vue': '^2.7',
    },
    2: {
      '@vue/composition-api': 'latest',
      '@vue/test-utils': '1',
      'vite-plugin-vue2': 'latest',
      'vue': '~2.6',
      'vue-template-compiler': '~2.6',
    },
  }, deps)

  console.log(Deps)

  for (const k in Deps) {
    if (k !== targetVersion) {
      for (const k2 in Deps[k])
        delete pkg.devDependencies[k2]
    }
  }

  for (const k in Deps[targetVersion])
    pkg.devDependencies[k] = Deps[targetVersion][k]

  Deno.writeTextFileSync(cwd + '\\package.json', JSON.stringify(pkg, null, 2))

  await run({ cmd: 'pnpm i' })
  await run({ cmd: `npx vue-demi-switch ${targetVersion}` })
}
