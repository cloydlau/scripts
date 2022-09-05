# @cloydlau/scripts

Deno 编写的脚本合集。

```sh
# 安装 Deno（PowerShell）
irm https://x.deno.js.cn/install.ps1 | iex

# 查看 Deno 版本
deno -V

# 全局安装 @cloydlau/scripts
npm add @cloydlau/scripts -g

# 查看 @cloydlau/scripts 提供的命令
cl -h
```

<br>

## 删除 node_modules

```sh
cl clean
```

<br>

## 更新依赖

```sh
cl up [include]

# 例子
cl up
cl up "axios,sass,vite"
```

<br>

## 校验 Commit Message

```sh
cl verifyCommit

# 通常作为 husky 钩子使用
```

<br>

## 切换 Vue 版本

```sh
cl switchVue [version] --vue2deps <vue2deps> --vue3deps <vue3deps>

# version 非必填，可选值：2.6 / 2.7 / 3

# 例子
cl switchVue
cl switchVue 2.6 --vue2deps "vue-router@3,element-ui" --vue3deps "vue-router,element-plus"
```

<br>

## 同步下游

```sh
cl syncFork <dir> [--base <base>]

# 例子
cl syncFork "aaa,bbb,ccc" --base "D:/workspace/up/"
cl syncFork "D:/workspace/up/aaa,D:/workspace/up/aaa/bbb,D:/workspace/up/aaa/ccc"
```

<br>

## 发版

```sh
cl release
```

例子：`"release": "vitest run && pnpm build && cl release"`

<br>

## 基准测试

运行一条命令，并计算其耗费的时间

```sh
cl benchmark <cmd>

# 例子
cl benchmark "pnpm i"
```

<br>

## 设置包管理器镜像

让 `pnpm`、`yarn`、`npm` 在淘宝镜像和无镜像之间快速切换。

```sh
cl npmmirror
```

<br>
