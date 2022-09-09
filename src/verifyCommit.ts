export default () => {
  const m = Deno.readTextFileSync('.git/COMMIT_EDITMSG').trim()
  if (!/^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?!?: .{1,50}/
    .test(m)) {
    console.error(`Invalid commit message format: ${m}
      See https://github.com/vuejs/core/blob/main/.github/commit-convention.md for more details.`)
    throw new Error('Invalid commit message format')
  }
}
