import fs from "fs";
import exec from "./exec";

import getReleases from "./get-releases";
import tagAndPublish from "./github-tag-and-publish";

async function main() {
  process.chdir(`${__dirname}/../`);

  const { ref, release, nightly } = await getReleases();

  const tags = [];
  if (release) tags.push(release);
  if (nightly) tags.push(nightly);

  if (!tags.length) return;

  fs.writeFileSync(
    `${__dirname}/synchronet-version-reference.json`,
    JSON.stringify(ref, null, 2),
    "utf8"
  );

  tagAndPublish(tags);
}

main().catch((error) => {
  console.error(error);
  process.exit(-1);
});
