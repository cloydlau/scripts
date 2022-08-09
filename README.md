# @cloydlau/scripts

Deno 编写的脚本合集。

```sh
# 安装 Deno（PowerShell）
iwr https://deno.land/install.ps1 -useb | iex

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
cl up axios,sass,vite
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
cl switchVue <version> --vue2deps <vue2deps> --vue3deps <vue3deps>

# version 可选值：2 / 2.7 / 3

# 例子
cl switchVue 2 --vue2deps vue-router@3,element-ui --vue3deps vue-router,element-plus
```

<br>

## 同步下游

```sh
cl syncFork <dir> --base <base>

# 例子
cl syncFork aaa,bbb,ccc --base D:/workspace/up/
cl syncFork D:/workspace/up/aaa,D:/workspace/up/aaa/bbb,D:/workspace/up/aaa/ccc
```

<br>

## 发版

```sh
cl release
```

<br>
