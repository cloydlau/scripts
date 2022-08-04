/**
 * 校验 commit message
 */

import chalk from "https://deno.land/x/chalk_deno@v4.1.1-deno/source/index.js"

export default () => {
  const msg = Deno.readTextFileSync('.git/COMMIT_EDITMSG').trim()
  const commitRE = /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/

  if (!commitRE.test(msg)) {
    console.error(
      `  ${chalk.bgRed.white(' ERROR ')} ${chalk.red(
        `invalid commit message format.`
      )}\n\n` +
      chalk.red(
        `  Proper commit message format is required for automated changelog generation. Examples:\n\n`
      ) +
      `    ${chalk.green(`feat(compiler): add 'comments' option`)}\n` +
      `    ${chalk.green(
        `fix(v-model): handle events on blur (close #28)`
      )}\n\n` +
      chalk.red(`  See .github/commit-convention.md for more details.\n`)
    )
  }
}
