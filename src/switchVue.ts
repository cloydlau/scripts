//import parseArgs from 'https://deno.land/x/deno_minimist@v1.0.2/mod.ts'
import { Select } from "https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts"
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
  2.6: {
    '@vue/runtime-dom': 'latest', // unplugin-vue2-script-setup 需要
    'unplugin-vue2-script-setup': 'latest',
    '@vue/composition-api': 'latest',
    '@vue/test-utils': '1',
    'vite-plugin-vue2': 'latest',
    'vue': '2.6',
    'vue-template-compiler': '2.6',
  },
}

//const targetVersion = args._[0]
/* let currentVersion
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
    currentVersion = '2.6'
  else {
    currentVersion = '3'
  }
} */

export default async (targetVersion, { vue2deps, vue3deps }) => {
  //const args = parseArgs(Deno.args)
  const pkg = JSON.parse(Deno.readTextFileSync('./package.json'))

  targetVersion ??= await Select.prompt({
    message: 'Select Vue version',
    options: Array.from(['3', '2.7', '2.6'], value => ({ name: value, value })),
    hint: "Press 'u' for up and 'd' for down.",
  })

  // PowerShell
  /* await run(`Set-Variable -Name "VUE_VERSION" -Value "${targetVersion}"`)
  await run('$VUE_VERSION')
  await run('($VUE_VERSION)')
  await run('${VUE_VERSION}') */
  // CMD
  //await run(`set VUE_VERSION=${targetVersion}`)

  vue2deps?.map((v) => {
    let [name, version] = v.split('@')
    version ??= 'latest'
    DEPS[2.6][name] = version
    DEPS[2.7][name] = version
  })

  vue3deps?.map((v) => {
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

    try {
      await run('pnpm i')
    } catch (e) {
      // 可能会有 Unmet peer dependencies 的报错，不影响
    }
    await run(`npx vue-demi-switch ${targetVersion === '2.6' ? '2' : targetVersion}`)
  }
  await run('npx eslint ./package.json --fix')
}
