#!/usr/bin/env -S deno -q run --allow-read --allow-write

const delay = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

// Fix Interface binding to IPv4 only - errors in container environment.
let sbbsini = await Deno.readTextFile(`/sbbs/ctrl/sbbs.ini`);
sbbsini = sbbsini.replace(/\n\s+Interface[^\n]+/, "\n    Interface = 0.0.0.0");
await Deno.writeTextFile(`/sbbs/ctrl/sbbs.ini`, sbbsini);

// use /sbbs/web directory for web file(s) ecweb/webv4 by default
let modopts = await Deno.readTextFile(`/sbbs/ctrl/modopts.ini`);
modopts = modopts.replace("../webv4", "../web");
await Deno.writeTextFile(`/sbbs/ctrl/modopts.ini`, modopts);

// let file-io catch up
await delay(100);
