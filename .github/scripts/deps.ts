import { exec as _exec } from "https://deno.land/x/exec@0.0.5/mod.ts";
import * as path from "https://deno.land/std@0.154.0/path/posix.ts";

const baseDir = (() => {
  const url = import.meta.url;
  const u: URL = new URL(import.meta.url);
  const f: string = u.protocol === "file:" ? u.pathname : url;
  const d: string = f.replace(/[/][^/]*$/, "");
  return path.normalize(`${d}/../..`);
})();

const exec = async (cmd) => {
  console.log(cmd);
  const result = await _exec(cmd);
  console.log(result.output);
  if (result.status.code) {
    Deno.exit(result.status.code);
  }
};

export { exec, baseDir };
