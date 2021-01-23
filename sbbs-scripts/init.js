import shell from 'shelljs';
import { promises as fsp } from 'fs';

/*
if [ ! -e "/sbbs/ctrl/sbbs.ini" ]; then
	echo "* Installing SBBS ctrl files into /sbbs/ctrl"
	cp -a /sbbs/ctrl.orig/* /sbbs/ctrl
fi

# TODO: Copy xtrn.orig files into /sbbs/xtrn as needed
*/
const getOldVersion = (SBBSCTRL) => fsp.readFile(`/sbbs/ctrl/version.txt`, 'utf8').catch(() => null);

const getCurrentVersion = (SBBSEXEC) => {
	const { code, stdout, stderr } = shell.exec(`${SBBSEXEC}/sbbs --version`, {silent:true});
	if (code !== 0) {
		throw Object.assign(new Error('Unable to determine Synchronet version'), {code, stdout, stderr});
	}
	const version = (/Version\s(\S+)/i).exec(stdout)[1].toLowerCase();
	return version;
}

async function checkCtrl(source, dest) {
	const hasIniFile = await fsp.stat(`${dest}/sbbs.ini`).then(() => true).catch(() => false);
	if (hasIniFile) return;

	// new install
	console.log(`Initial install, creating ${dest} from ${source}`);
	shell.mkdir('-p', dest);
	shell.cp('-rf', `${source}/*`, dest);
}

async function checkDest(source, dest) {
	const files = await fsp.readdir(dest);
	if (!files.length) {
		console.log(`Creating ${dest} from ${source}`);
		shell.cp('-r', `${source}/*`, dest);
	}
}

async function upgrade({ SBBSXTRN_ORIG, SBBSXTRN, currentVersion }) {
	const now = new Date().toISOString().replace(/\D/g,'').substr(0,14);

	// backup and replace text.dat file
	const oldDat = await fsp.readFile(`/sbbs/ctrl/text.dat`, 'utf8');
	const newDat = await fsp.readFile(`/sbbs/ctrl.orig/text.dat`, 'utf8');
	if (oldDat !== newDat) {
		await shell.cp(`/sbbs/ctrl/text.dat`, `/sbbs/ctrl/text.dat.${now}.bak`);
		await shell.cp(`/sbbs/ctrl.orig/text.dat`, `/sbbs/ctrl/text.dat`)
	}

	// Upgrade built in externals/doors -- clobbering, is this safe???
	shell.cp('-r', `/sbbs/xtrn.orig/*`, `/sbbs/xtrn`);

	// other data migrations/upgrades will go here
	checkDest(`/sbbs/text.orig`, `/sbbs/text/`);
	checkDest(`/sbbs/webv4`, `/sbbs/web/`);

	// Update reference file(s)
	shell.mkdir('-p', '/sbbs/reference/exec');
	shell.mkdir('-p', '/sbbs/reference/docs');
	shell.mkdir('-p', '/sbbs/reference/text');
	shell.mkdir('-p', '/sbbs/reference/web');
	shell.cp('-r', `/sbbs/exec/*`, `/sbbs/reference/exec/`);
	shell.cp('-r', `/sbbs/docs/*`, `/sbbs/reference/docs/`);
	shell.cp('-r', `/sbbs/ctrl.orig/*`, `/sbbs/reference/ctrl/`);
	shell.cp('-r', `/sbbs/text.orig/*`, `/sbbs/reference/text/`);
	shell.cp('-r', `/sbbs/web.orig/*`, `/sbbs/reference/web-legacy/`);
	shell.cp('-r', `/sbbs/webv4/*`, `/sbbs/reference/webv4/`);

	// write current version to version.txt file for upgrade tracking
	await fsp.writeFile(`/sbbs/ctrl/version.txt`, currentVersion, 'utf8');
}

async function main() {
	const { 
		SBBSEXEC='/sbbs/exec',
		SBBSCTRL_ORIG='/sbbs/ctrl.orig',
		SBBSCTRL='/sbbs/ctrl',
		SBBSXTRN_ORIG='/sbbs/xtrn.orig',
		SBBSXTRN='/sbbs/xtrn',
	} = process.env;

	// Initial check for sbbsctrl
	await checkCtrl(SBBSCTRL_ORIG, SBBSCTRL);

	const oldVersion = await getOldVersion(SBBSCTRL);
	const currentVersion = await getCurrentVersion(SBBSEXEC) || 'Unknown';

	if (!oldVersion || oldVersion !== currentVersion) {
		await upgrade({ SBBSCTRL_ORIG, SBBSCTRL, SBBSXTRN_ORIG, SBBSXTRN, SBBSEXEC, currentVersion })
	}

	// Add read-write permissions for all on volume data
	shell.chmod('-R', '+rw', '/sbbs/reference');
	shell.chmod('-R', '+rw', '/sbbs/ctrl');
	shell.chmod('-R', '+rw', '/sbbs/data');
	shell.chmod('-R', '+rw', '/sbbs/fido');
	shell.chmod('-R', '+rw', '/sbbs/xtrn');
	shell.chmod('-R', '+rw', '/sbbs/mods');
	shell.chmod('-R', '+rw', '/sbbs/text');
	shell.chmod('-R', '+rw', '/sbbs/web');
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1); // error
	});