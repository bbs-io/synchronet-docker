import shell from "shelljs";
import { promises as fsp } from "fs";

const getOldVersion = () =>
  fsp.readFile(`/sbbs/ctrl/version.txt`, "utf8").catch(() => null);

const getCurrentVersion = () =>
  fsp.readFile(`/sbbs/exec/version.txt`, "utf8").catch(() => null);

const exists = (filePath) =>
  fsp
    .stat(filePath)
    .then(() => true)
    .catch(() => false);

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function checkCtrl(source, dest) {
  const hasIniFile = await exists(`${dest}/sbbs.ini`);
  if (hasIniFile) return;

  // new install - copy from initial ctrl directory
  shell.mkdir("-p", dest);
  shell.cp("-rf", `${source}/*`, dest);
}

async function checkDest(source, dest) {
  const files = await fsp.readdir(dest);
  if (!files.length) {
    shell.cp("-r", `${source}/*`, dest);
  }
}

async function checkXtrn() {
  const dest = await fsp.readdir("/sbbs/xtrn");
  const list = await fsp.readdir("/sbbs/xtrn.orig");
  for (const item of list) {
    if (dest.includes(item)) continue;
    shell.cp("-r", `/sbbs/xtrn.orig/${item}/`, `/sbbs/xtrn/${item}/`);
  }
  shell.cp("-r", `/sbbs/xtrn.orig/3rdp-install/`, `/sbbs/xtrn/3rdp-install/`);
}

async function checkNode(n) {
  const nodesDir = `/sbbs/nodes/node${n}/`;
  const nodeDir = `/sbbs/node${n}/`;
  if (!(await exists(nodesDir))) {
    shell.mkdir("-p", nodesDir);
    shell.cp("-r", "/sbbs/node.orig/*", nodesDir);
  }
  if (!(await exists(nodeDir))) {
    shell.ln("-s", nodesDir, nodeDir);
  }
  await delay(10);
}

// Check that the appropriate number of nodes directories exist, and symlink to
// default in-container location.
async function checkNodes() {
  await checkNode(1); // ensure /sbbs/node1 exists, will error without it.
  await fsp.writeFile(`/sbbs/exec/get-node-count.js`);
  const { stdout, stderr, code } = shell.exec(
    // 'jsexec -n -r "write(JSON.stringify({nodes:system.nodes}));"',
    "jsexec -n /sbbs/exec/get-node-count.js",
    { silent: true }
  );
  await fsp.unlink(`/sbbs/exec/get-node-count.js`);

  if (code)
    throw Object.assign(new Error("Unexpected error"), {
      stdout,
      stderr,
      code,
    });
  const { nodes } = JSON.parse(stdout);

  for (var i = 2; i <= nodes; i++) {
    await checkNode(i);
  }
}

async function upgrade({ currentVersion }) {
  const now = new Date().toISOString().replace(/\D/g, "").substr(0, 14);

  // backup and replace text.dat file
  const oldDat = await fsp.readFile(`/sbbs/ctrl/text.dat`, "utf8");
  const newDat = await fsp.readFile(`/sbbs/ctrl.orig/text.dat`, "utf8");
  if (oldDat !== newDat) {
    await shell.cp(`/sbbs/ctrl/text.dat`, `/sbbs/ctrl/text.dat.${now}.bak`);
    await shell.cp(`/sbbs/ctrl.orig/text.dat`, `/sbbs/ctrl/text.dat`);
  }

  // other data migrations/upgrades will go here
  checkDest(`/sbbs/text.orig`, `/sbbs/text/`);
  checkDest(`/sbbs/webv4`, `/sbbs/web/`);
  await checkXtrn();

  // Update reference file(s)
  shell.mkdir("-p", "/backup/defaults/exec");
  shell.mkdir("-p", "/backup/defaults/xtrn/.cache");
  shell.mkdir("-p", "/backup/defaults/xtrn/_deno");
  shell.mkdir("-p", "/backup/defaults/xtrn/_node");
  shell.mkdir("-p", "/backup/defaults/docs");
  shell.mkdir("-p", "/backup/defaults/ctrl");
  shell.mkdir("-p", "/backup/defaults/text");
  shell.mkdir("-p", "/backup/defaults/web-runemaster");
  shell.mkdir("-p", "/backup/defaults/web-ecweb4");
  shell.cp("-rf", `/sbbs/exec/*`, `/backup/defaults/exec/`);
  shell.cp("-rf", `/sbbs/xtrn.orig/*`, `/backup/defaults/xtrn/`);
  shell.cp("-rf", `/sbbs/docs/*`, `/backup/defaults/docs/`);
  shell.cp("-rf", `/sbbs/ctrl.orig/*`, `/backup/defaults/ctrl/`);
  shell.cp("-rf", `/sbbs/text.orig/*`, `/backup/defaults/text/`);
  shell.cp("-rf", `/sbbs/web.orig/*`, `/backup/defaults/web-runemaster/`);
  shell.cp("-rf", `/sbbs/webv4/*`, `/backup/defaults/web-ecweb4/`);

  // write current version to version.txt file for upgrade tracking
  await fsp.writeFile(`/sbbs/ctrl/version.txt`, currentVersion, "utf8");
}

async function main() {
  const oldVersion = await getOldVersion();
  const currentVersion = (await getCurrentVersion()) || "Unknown";

  // Initial check for sbbsctrl
  await checkCtrl("/sbbs/ctrl.orig", "/sbbs/ctrl");
  await checkNodes();

  if (oldVersion !== currentVersion) {
    await upgrade({ currentVersion });
    await delay(1000);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1); // error
  });
