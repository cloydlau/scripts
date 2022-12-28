export default async (cmdOrOptions: string[] | Deno.RunOptions) => {
  const Options: Deno.RunOptions = Array.isArray(cmdOrOptions)
    ? { cmd: cmdOrOptions }
    : cmdOrOptions

  // cmd /c
  // powershell -Command {${cmd}}
  const cmd = ['powershell', '-c', ...Options.cmd]

  const p = Deno.run({
    ...Options,
    cmd,
  })
  const { code } = await p.status() // (*1); wait here for child to finish
  p.close()
  const output = Options.stdout === 'piped' ? new TextDecoder('utf-8').decode(await p.output()).trim() : ''
  if (code === 0) {
    return output
  } else {
    // console.log(`\n%cFailed cmd: ${cmd}\n`, 'color:red; font-weight:bold;')
    return Promise.reject(output)
  }
}
