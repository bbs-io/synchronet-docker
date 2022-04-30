#!/usr/bin/env -S deno -q run --unstable --allow-run --allow-read --allow-write

import { copySync } from "https://deno.land/std@0.137.0/fs/copy.ts";
import { ensureFileSync } from "https://deno.land/std@0.137.0/fs/mod.ts";

// get directory entries to start from
const dirDist = Array.from(Deno.readDirSync("/sbbs/dist"));
const dirSbbs = Array.from(Deno.readDirSync("/sbbs"));
const dirData = Array.from(Deno.readDirSync("/sbbs-data"));

const delay = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

const dirExists = (list: Deno.DirEntry[], name: string): boolean =>
  !!list.find((x) => (x.isDirectory || x.isSymlink) && x.name === name);

async function hydrateAndLink(distName: string, sbbsName: string) {
  if (!dirExists(dirSbbs, sbbsName)) {
    if (!dirExists(dirData, sbbsName)) {
      if (!distName) {
        // no distName specified - create empty directory
        Deno.mkdirSync(`/sbbs-data/${sbbsName}`, { recursive: true });
      } else {
        copySync(`/sbbs/dist/${distName}`, `/sbbs-data/${sbbsName}`);
      }
    }
    Deno.symlinkSync(`/sbbs-data/${sbbsName}`, `/sbbs/${sbbsName}`);
  }
}

async function checkNode(dirNodes: Deno.DirEntry[], n: number) {
  if (!dirExists(dirNodes, `node${n}`)) {
    copySync("/sbbs/dist/node1", `/sbbs-data/nodes/node${n}`);
  }
  if (!dirExists(dirSbbs, `node${n}`)) {
    Deno.symlinkSync(`/sbbs-data/nodes/node${n}`, `/sbbs/node${n}`);
  }
}

async function checkNodes() {
  const proc = await Deno.run({
    cmd: ["jsexec", "-n", "-r", `write(system.nodes)`],
    stdout: "piped",
    stderr: "piped",
  });

  const status = await proc.status();
  const stdout = new TextDecoder().decode(await proc.output());
  const stderr = new TextDecoder().decode(await proc.stderrOutput());

  if (!status.success) {
    throw Object.assign(
      new Error("Unable to retrieve node count."),
      { status, stdout, stderr },
    );
  }

  if (!dirExists(dirData, "nodes")) {
    Deno.mkdirSync("/sbbs-data/nodes");
  }
  const lastNode: number = ~~stdout;
  const dir = Array.from(Deno.readDirSync("/sbbs-data/nodes"));

  for (var i = 1; i < ~~stdout + 1; i++) {
    await checkNode(dir, i);
  }
}

async function backupDist() {
  Deno.mkdirSync("/sbbs-data/backup/defaults", { recursive: true });
  await delay(100);
  copySync(
    "/sbbs/exec",
    "/sbbs-data/backup/defaults/exec",
    { overwrite: true },
  );
  for (var dir of dirDist) {
    copySync(
      `/sbbs/dist/${dir.name}`,
      `/sbbs-data/backup/defaults/${dir.name}`,
      { overwrite: true },
    );
  }
}

async function upgrade(newVersion: string | null) {
  const now = new Date().toISOString().replace(/\D/g, "").substr(0, 14);

  // backup and replace text.dat
  const oldDat = await Deno.readTextFile("/sbbs/ctrl/text.dat");
  const newDat = await Deno.readTextFile("/sbbs/dist/ctrl/text.dat");
  if (oldDat != newDat) {
    await copySync("/sbbs/ctrl/text.dat", `/sbbs/ctrl/text.dat.${now}.bak`, {
      overwrite: true,
    });
    await copySync("/sbbs/dist/ctrl/text.dat", `/sbbs/ctrl/text.dat`, {
      overwrite: true,
    });
  }

  await backupDist();
}

async function checkAll() {
  console.log("Synchronet Docker Runtime Initializing...");

  ensureFileSync("/sbbs-data/lock");
  var f = Deno.openSync("/sbbs-data/lock");
  try {
    // attempt to lock file, single initialization at a time.
    await Deno.flock(f.rid, true);

    await hydrateAndLink("ctrl", "ctrl");
    await hydrateAndLink("xtrn", "xtrn");
    await hydrateAndLink("text", "text");
    await hydrateAndLink("web-ecweb4", "web");
    await hydrateAndLink("", "mods");
    await hydrateAndLink("", "fido");
    await checkNodes();

    const oldVersion = await Deno.readTextFile(`/sbbs/ctrl/version.txt`)
      .catch(() => null);
    const newVersion = await Deno.readTextFile(`/sbbs/exec/version.txt`)
      .catch(() => null);

    if (oldVersion != newVersion) {
      upgrade(newVersion);
      await delay(1000);
    }
  } catch (err) {
    await Deno.funlock(f.rid).catch(() => {});
    await Deno.remove("/sbbs-data/lock").catch(() => {});
    throw err;
  }
}

checkAll();
