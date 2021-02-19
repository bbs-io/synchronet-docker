// import shell from 'shelljs';
import { promises as fsp } from 'fs';

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  // Fix Interface binding to IPv4 only - errors in container environment.
  let sbbsini = await fsp.readFile(`/sbbs/ctrl.orig/sbbs.ini`, 'utf8');
  sbbsini = sbbsini.replace(/\n\s+Interface[^\n]+/, '\n    Interface = 0.0.0.0');
  await fsp.writeFile(`/sbbs/ctrl.orig/sbbs.ini`, sbbsini, 'utf8');

  // fix interface binding to IPv4 only
  let ircdjs = await fsp.readFile(`/sbbs/exec/ircd.js`, 'utf8');
  ircdjs = ircdjs.replace(`["0.0.0.0","::"]`, '["0.0.0.0"]');
  await fsp.writeFile(`/sbbs/exec/ircd.js`, ircdjs, 'utf8');

	// use /sbbs/web directory for web file(s) ecweb/webv4 by default
	let modopts = await fsp.readFile(`/sbbs/ctrl.orig/modopts.ini`, 'utf8');
	modopts = modopts.replace('../webv4', '../web');
  await fsp.writeFile(`/sbbs/ctrl.orig/modopts.ini`, modopts, 'utf8');

  // let file-io catch up
  await delay(100);
}

main().catch(error => {
  console.log(error);
  process.exit(1);
})