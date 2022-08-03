export default async (opt) => {
  if (opt.cmd) {
    opt.cmd = ['cmd', '/c', ...opt.cmd.split(' ')]
  }
  const p = Deno.run(opt)
  const { code } = await p.status() // (*1); wait here for child to finish
  p.close()
  if (opt.stdout === 'piped')
    return new TextDecoder().decode(await p.output()).trim()
}
