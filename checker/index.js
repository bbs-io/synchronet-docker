import fs from "fs";
import shell from "shelljs";

import getLatestRelease from "./get-latest-release";
import getLatestNightly from "./get-latest-nightly";

const versionFile = `${__dirname}/synchronet_version_ref.json`;

function getLastVersion() {
  if (!fs.existsSync(versionFile)) {
    return { release: null, nightly: null };
  }
  return JSON.parse(fs.readFileSync(versionFile, "utf8"));
}

async function getTags() {
  const old = getLastVersion();
  let release = await getLatestRelease();
  let nightly = await getLatestNightly();

  if (
    // no release details
    !release ||
    !release.release ||
    !release.hash ||
    // already matches preview value
    (old.release &&
      release.release === old.release.release &&
      release.hash === old.release.hash)
  ) {
    release = null;
  }

  if (
    // no release details
    !nightly ||
    !nightly.release ||
    !nightly.hash ||
    // already matches preview value
    (old.nightly &&
      nightly.release === old.nightly.release &&
      nightly.hash === old.nightly.hash)
  ) {
    nightly = null;
  }

  if (!(release || nightly)) return null;
  return {
    content: { release, nightly },
    release: release ? `release-${release.release}` : null,
    nightly: nightly ? `nightly-${nightly.release}` : null,
  };
}

async function main() {
  shell.cd(`${__dirname}/../`);

  const data = await getTags();
  if (!data) return;

  if (process.env.DEV === "1") shell.exec(`git pull`);
  const { content, release, nightly } = data;

  let comment = "";
  if (release) {
    comment += release;
  }
  if (nightly) {
    comment += release ? ` and ` : "";
    comment += nightly;
  }

  fs.writeFileSync(versionFile, JSON.stringify(content), "utf8");
  shell.exec("git add checker/synchronet_version_ref.json");

  shell.exec(`git commit -am "${comment}"`);
  shell.exec(`git push origin master`);

  if (release) {
    shell.exec(`git tag ${release}`);
  }
  if (nightly) {
    shell.exec(`git tag ${nightly}`);
  }

  shell.exec(`git push origin --tags`);
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
