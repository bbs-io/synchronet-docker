#!/usr/bin/env -S deno -q run --unstable --allow-run --allow-read --allow-write

import {
	copySync,
	ensureFileSync,
	ensureDirSync,
	ensureSymlinkSync,
} from "https://deno.land/std@0.159.0/fs/mod.ts";

// get directory entries to start from
const dirDist = Array.from(Deno.readDirSync("/sbbs/dist"));
const dirSbbs = Array.from(Deno.readDirSync("/sbbs"));
const dirData = Array.from(Deno.readDirSync("/sbbs-data"));

const delay = (ms: number): Promise<void> =>
	new Promise((r) => setTimeout(r, ms));

const dirExists = (list: Deno.DirEntry[], name: string): boolean =>
	!!list.find((x) => (x.isDirectory || x.isSymlink) && x.name === name);

function hydrateAndLink(distName: string, sbbsName: string) {
	if (dirExists(dirSbbs, sbbsName)) {
		// already exists
		return;
	}

	// console.log(`Missing: /sbbs/${sbbsName}`);
	if (!dirExists(dirData, sbbsName)) {
		// console.log(`Missing /sbbs-data/${sbbsName}`);
		if (!distName) {
			// no distName specified - create empty directory
			// console.log(`Creating /sbbs-data/${sbbsName}`);
			Deno.mkdirSync(`/sbbs-data/${sbbsName}`, { recursive: true });
		} else {
			// console.log(`Copying /sbbs/dist/${distName} to /sbbs-data/${sbbsName}`);
			copySync(`/sbbs/dist/${distName}`, `/sbbs-data/${sbbsName}`);
		}
	}
	// console.log(`Symlink /sbbs/${sbbsName} to /sbbs-data/${sbbsName}`);
	ensureSymlinkSync(`/sbbs-data/${sbbsName}`, `/sbbs/${sbbsName}`);
}

function checkNode(dirNodes: Deno.DirEntry[], n: number) {
	if (!dirExists(dirNodes, `node${n}`)) {
		copySync("/sbbs/dist/node1", `/sbbs-data/nodes/node${n}`);
	}
	if (!dirExists(dirSbbs, `node${n}`)) {
		ensureSymlinkSync(`/sbbs-data/nodes/node${n}`, `/sbbs/node${n}`);
	}
}

async function checkNodes() {
	if (!dirExists(dirData, "nodes")) {
		Deno.mkdirSync("/sbbs-data/nodes");
	}
	const dir = Array.from(Deno.readDirSync("/sbbs-data/nodes"));

	let lastNode: number =
		dir.map((n) => ~~n.name.replace("node", "")).sort((a, b) => b - a)[0] || 4;
	console.log({ lastNode });
	try {
		const proc = await Deno.run({
			cmd: ["/sbbs/exec/jsexec", "-n", "-r", `write(system.nodes)`],
			stdout: "piped",
			stderr: "piped",
		});

		const status = await proc.status();
		const stdout = new TextDecoder().decode(await proc.output());
		const stderr = new TextDecoder().decode(await proc.stderrOutput());

		if (status.success && !stderr) {
			lastNode = ~~stdout || lastNode;
		}
	} catch (_err) {}

	for (let i = 1; i < lastNode + 1; i++) {
		checkNode(dir, i);
	}
}

async function backupDist() {
	Deno.mkdirSync("/sbbs-data/backup/defaults", { recursive: true });
	await delay(100);
	copySync("/sbbs/exec", "/sbbs-data/backup/defaults/exec", {
		overwrite: true,
	});
	for (const dir of dirDist) {
		copySync(
			`/sbbs/dist/${dir.name}`,
			`/sbbs-data/backup/defaults/${dir.name}`,
			{ overwrite: true },
		);
	}
}

async function runUpgradeJs() {
	console.log("Running upgrade script(s)");
	const proc = await Deno.run({
		cmd: ["/sbbs/exec/jsexec", "-n", "/sbbs/exec/update.js"],
		stdout: "piped",
		stderr: "piped",
	});

	const status = await proc.status();
	const stdout = new TextDecoder().decode(await proc.output());
	const stderr = new TextDecoder().decode(await proc.stderrOutput());

	if (!status.success) {
		throw Object.assign(new Error("Unable to retrieve node count."), {
			status,
			stdout,
			stderr,
		});
	}
	if (stderr) {
		console.log(stdout);
		console.log(stderr);
		// console.log(status);
		Deno.exit(1);
	}
}

async function upgrade(upgradeJs: boolean) {
	console.log("Backing up...");
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

	await delay(500);
	if (upgradeJs) {
		await runUpgradeJs();
	}
	await delay(500);

	copySync(`/sbbs/exec/version.txt`, `/sbbs/ctrl/version.txt`, {
		overwrite: true,
	});
}

async function checkAll() {
	console.log("Synchronet Docker Runtime Initializing...");

	ensureFileSync("/sbbs-data/lock");
	const f = Deno.openSync("/sbbs-data/lock");
	try {
		// attempt to lock file, single initialization at a time.
		await Deno.flock(f.rid, true);

		ensureDirSync(`/sbbs-data/backup`);
		ensureSymlinkSync(`/sbbs-data/backup`, `/backup`);

		hydrateAndLink("ctrl", "ctrl");
		hydrateAndLink("xtrn", "xtrn");
		hydrateAndLink("text", "text");
		hydrateAndLink("web-ecweb4", "web");
		hydrateAndLink("", "mods");
		hydrateAndLink("", "fido");
		checkNodes();

		const oldVersion = await Deno.readTextFile(`/sbbs/ctrl/version.txt`).catch(
			() => "",
		);
		const newVersion = await Deno.readTextFile(`/sbbs/exec/version.txt`).catch(
			() => "",
		);

		if (oldVersion != newVersion) {
			console.log("New version detected.");
			console.log(newVersion);
			upgrade(!!oldVersion);
		}
	} finally {
		await Deno.funlock(f.rid).catch(() => {});
		await Deno.remove("/sbbs-data/lock").catch(() => {});
	}
}

checkAll();
