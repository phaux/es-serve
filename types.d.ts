declare module "string-replace-async" {
  function stringReplaceAsync(s: string, r: RegExp, cb: (...args: string[]) => Promise<string>): Promise<string>
  export = stringReplaceAsync
}
