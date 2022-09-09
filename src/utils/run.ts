export default async (cmdOrOptions: string[] | Deno.RunOptions) => {
  const Options: Deno.RunOptions = Array.isArray(cmdOrOptions) ? { cmd: cmdOrOptions } : cmdOrOptions
  // @ts-ignore:
  // 'powershell', '-NoExit', '-Command', `{${cmd}}`
  Options.cmd.unshift('cmd', '/c')
  // Options.cmd.unshift('powershell', '-Command')
  const p = Deno.run(Options)
  const { code } = await p.status() // (*1); wait here for child to finish
  p.close()
  if (code === 0 && Options.stdout === 'piped') {
    return new TextDecoder().decode(await p.output()).trim()
  }
}
