export default async (cmdOrOptions: string[] | Deno.RunOptions) => {
  const Options: Deno.RunOptions = Array.isArray(cmdOrOptions)
    ? { cmd: cmdOrOptions }
    : cmdOrOptions

  // cmd /c
  // powershell -Command {${cmd}}
  Options.cmd.unshift('powershell', '-c')

  const p = Deno.run(Options)
  const { code } = await p.status() // (*1); wait here for child to finish
  p.close()
  if (code === 0) {
    if (Options.stdout === 'piped') {
      return new TextDecoder().decode(await p.output()).trim()
    }
  } else {
    return Promise.reject()
  }
}
