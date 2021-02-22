import fs from "fs";
import exec from "./exec";

import getReleases from "./get-releases";

async function main() {
  process.chdir(`${__dirname}/../`);

  const { ref, release, nightly } = await getReleases();

  let comment = "";
  if (release) {
    comment += release;
  }
  if (nightly) {
    comment += comment ? ` and ` : "";
    comment += nightly;
  }

  // nothing to do
  if (!comment) return;

  console.log("Tagging: ", comment, `\n${JSON.stringify(ref, null, 2)}`);
  fs.writeFileSync(
    `${__dirname}/../docker/synchronet-version-reference.json`,
    JSON.stringify(ref, null, 2),
    "utf8"
  );
  return; // for local testing, only show releases

  exec(`git commit -am "${comment}"`);
  exec(`git push origin master`);

  if (release) {
    exec(`git tag ${release}`);
  }
  if (nightly) {
    exec(`git tag ${nightly}`);
  }

  exec(`git push origin --tags`);
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
