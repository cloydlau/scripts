# @cloydlau/scripts

个人常用的脚本合集，使用 deno 编写

```sh
# 安装 deno（PowerShell）

iwr https://deno.land/install.ps1 -useb | iex

deno -V
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
cl up 'axios|sass|vite'
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
cl switchVue <version>

# version 可选值：2 / 2.7 / 3
```

<br>

## 同步下游

```sh
cl syncFork <dir> --base <base>

# 例子
cl syncFork 'aaa|bbb|ccc' --base 'D:\workspace\up\'
cl syncFork 'D:\workspace\up\aaa|D:\workspace\up\aaa\bbb|D:\workspace\up\aaa\ccc'
```

<br>

## 发版

```sh
cl release
```

<br>
