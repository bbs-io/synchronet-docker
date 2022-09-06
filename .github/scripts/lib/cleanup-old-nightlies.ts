import { exec } from "../deps.ts";

async function getNightlyTags() {
  let data: any = await fetch(
    "https://api.github.com/repos/bbs-io/synchronet-docker/git/matching-refs/tags/nightly",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    }
  ).then((r) => r.json());

  data = data.map((l) => l.ref.split("/").pop());

  return data;
}

export async function cleanupOldNightlies() {
  const tags = await getNightlyTags();
  tags.sort();

  // remove all but latest 5 nightlies
  while (tags.length > 5) {
    await exec(`git push --delete origin ${tags.shift()}`);
  }
}
