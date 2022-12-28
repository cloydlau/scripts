export default async (cmdOrOptions: string[] | Deno.RunOptions) => {
  const Options: Deno.RunOptions = Array.isArray(cmdOrOptions)
    ? { cmd: cmdOrOptions }
    : cmdOrOptions

  const p = Deno.run({
    ...Options,
    // cmd /c
    // powershell -Command {${cmd}}
    cmd: ['powershell', '-c', ...Options.cmd],
  })
  const { code } = await p.status() // (*1); wait here for child to finish
  p.close()
  const output = Options.stdout === 'piped' ? new TextDecoder('utf-8').decode(await p.output()).trim() : ''
  return code === 0 ? output : Promise.reject(output)
}
