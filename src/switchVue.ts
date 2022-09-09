import { Select } from 'https://deno.land/x/cliffy@v0.24.3/prompt/mod.ts'
import run from './utils/run.ts'

export type VueVersion = '3' | '2.7' | '2.6'
const vueVersion: VueVersion[] = ['3', '2.7', '2.6']

const DEPS: {
  [key in VueVersion]: {
    [key: string]: string
  }
} = {
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

// const targetVersion = args._[0]
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

export default async (targetVersion?: VueVersion) => {
  let pkgText
  try {
    pkgText = Deno.readTextFileSync('./package.json')
  } catch (_e) {
    console.error('%cCan not find ./package.json', 'color:red; font-weight:bold;')
    return
  }

  const pkg = JSON.parse(pkgText)

  targetVersion ??= await Select.prompt({
    message: 'Select Vue version',
    options: Array.from(vueVersion, value => ({ name: value, value })),
    hint: 'Press \'u\' for up and \'d\' for down.',
  }) as VueVersion

  let config
  try {
    config = await Deno.readTextFile('./switchVue.config.json')
  } catch (_e) {
    //
  }

  // PowerShell
  /* await run([`Set-Variable -Name "VUE_VERSION" -Value "${targetVersion}"`])
  await run(['$VUE_VERSION'])
  await run(['($VUE_VERSION)'])
  await run(['${VUE_VERSION}']) */
  // CMD
  // await run([`set VUE_VERSION=${targetVersion}`])

  if (config) {
    const { 2: vue2deps, 3: vue3deps } = JSON.parse(config)
    DEPS[2.6] = {
      ...DEPS[2.6],
      ...vue2deps,
    }
    DEPS[2.7] = {
      ...DEPS[2.7],
      ...vue2deps,
    }
    DEPS[3] = {
      ...DEPS[3],
      ...vue3deps,
    }
  }

  let changed = false

  for (const ver in DEPS) {
    if (ver !== targetVersion) {
      for (const deps in DEPS[ver as keyof typeof DEPS]) {
        // 删除非目标版本的依赖
        if (pkg.devDependencies[deps] && !DEPS[targetVersion][deps]) {
          delete pkg.devDependencies[deps]
          changed = true
        }
      }
    }
  }

  for (const targetDeps in DEPS[targetVersion]) {
    // 添加目标版本的依赖
    if (pkg.devDependencies[targetDeps] !== DEPS[targetVersion][targetDeps]) {
      pkg.devDependencies[targetDeps] = DEPS[targetVersion][targetDeps]
      changed = true
    }
  }

  if (changed) {
    Deno.writeTextFileSync('./package.json', JSON.stringify(pkg, null, 2))

    try {
      await run(['pnpm i'])
    } catch (_e) {
      // 可能会有 Unmet peer dependencies 的报错，不影响
    }
    await run([`npx vue-demi-switch ${targetVersion === '2.6' ? '2' : targetVersion}`])
  }
  await run(['npx eslint ./package.json --fix'])
}
