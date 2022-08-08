export default async (cmd, opt = {}) => {
  opt.cmd = ['cmd', '/c', ...cmd.split(' ')]
  const p = Deno.run(opt)
  const { code } = await p.status() // (*1); wait here for child to finish
  p.close()
  if (code !== 0) {
    throw Error(code)
  }
  if (opt.stdout === 'piped')
    return new TextDecoder().decode(await p.output()).trim()
}
