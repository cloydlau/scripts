# @cloydlau/scripts

个人常用的脚本合集，使用 deno 编写

```bash
# 安装 deno

iwr https://deno.land/install.ps1 -useb | iex

deno -V
```

<br>

## 删除 node_modules

```bash
cl clean
```

<br>

## 更新依赖

```bash
cl up
```

<br>

## 校验 Commit Message

```bash
cl verifyCommit

# 通常作为 husky 钩子使用
```

<br>

## 切换 Vue 版本

```bash
cl switchVue <version>

# version 可选值：2 / 2.7 / 3
```

<br>

## 同步下游

```bash
cl syncFork <base> --dir <dir>

# 例子
cl syncFork 'D:\workspace\up\' --dir 'aaa|bbb|ccc'
```

<br>

## 发版

```bash
cl release
```

<br>
