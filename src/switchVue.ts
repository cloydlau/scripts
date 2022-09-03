//import parseArgs from 'https://deno.land/x/deno_minimist@v1.0.2/mod.ts'
import { Confirm } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts"
import run from './utils/run.ts'

const DEPS = {
  3: {
    '@vitejs/plugin-vue': 'latest',
    '@vue/compiler-sfc': 'latest',
    '@vue/test-utils': 'latest',
    'vue': 'latest',
  },
  2.7: {
    '@vitejs/plugin-vue2': 'latest',
    '@vue/test-utils': '1',
    'vue': '2.7',
    'vue-template-compiler': '2.7', // @vue/test-utils@1 需要
  },
  2: {
    'unplugin-vue2-script-setup': 'latest',
    '@vue/composition-api': 'latest',
    '@vue/test-utils': '1',
    'vite-plugin-vue2': 'latest',
    'vue': '2.6',
    'vue-template-compiler': '2.6',
  },
}

//const args = parseArgs(Deno.args)
const pkg = JSON.parse(Deno.readTextFileSync('./package.json'))

//const targetVersion = args._[0]
let currentVersion
if (pkg.devDependencies.vue) {
  if ((
    pkg.devDependencies.vue === '2'
    || pkg.devDependencies.vue.startsWith('2.7')
    || pkg.devDependencies.vue.startsWith('~2.7')
    || pkg.devDependencies.vue.startsWith('^2.7')))
    currentVersion = '2.7'
  else if ((
    pkg.devDependencies.vue.startsWith('2.')
    || pkg.devDependencies.vue.startsWith('~2.')
    || pkg.devDependencies.vue.startsWith('^2.')))
    currentVersion = '2'
  else {
    currentVersion = '3'
  }
}

export default async (targetVersion, { vue2deps, vue3deps, force = false }) => {
  if (currentVersion && currentVersion !== targetVersion && !force) {
    const yes = await Confirm.prompt({
      type: 'confirm',
      message: `Current Vue version is ${currentVersion}, switch to ${targetVersion}？`,
    })
    if (!yes)
      return
  }

  vue2deps?.split(',').map((v) => {
    let [name, version] = v.split('@')
    version ??= 'latest'
    DEPS[2][name] = version
    DEPS[2.7][name] = version
  })

  vue3deps?.split(',').map((v) => {
    let [name, version] = v.substring(1).split('@')
    name = v[0] + name // 兼容包名首字母为@的情况
    version ??= 'latest'
    DEPS[3][name] = version
  })

  let changed = false

  for (const k in DEPS) {
    if (k !== targetVersion) {
      for (const k2 in DEPS[k]) {
        // 删除非目标版本的依赖
        if (pkg.devDependencies[k2] && !DEPS[targetVersion][k2]) {
          delete pkg.devDependencies[k2]
          changed = true
        }
      }
    }
  }

  for (const k in DEPS[targetVersion]) {
    // 添加目标版本的依赖
    if (pkg.devDependencies[k] !== DEPS[targetVersion][k]) {
      pkg.devDependencies[k] = DEPS[targetVersion][k]
      changed = true
    }
  }

  if (changed) {
    Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))
    await run('npx eslint ./package.json --fix')

    try {
      await run('pnpm i')
    } catch (e) {
      // 可能会有 Unmet peer dependencies 的报错，不影响
    }
    await run(`npx vue-demi-switch ${targetVersion}`)
  }
}
