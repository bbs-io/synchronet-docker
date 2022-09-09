#!/usr/bin/env -S deno -q run --unstable --allow-run --allow-read --allow-write --allow-net --allow-env

import { baseDir } from "./deps.ts";
import { cleanupOldNightlies } from "./lib/cleanup-old-nightlies.ts";
import { getReleases } from "./lib/get-releases.ts";
import { tagAndPublish } from "./lib/tag-and-publish.ts";

console.log("Running check.ts");

await cleanupOldNightlies();

const { ref, release, nightly } = await getReleases();

const tags: string[] = [];
if (release) tags.push(release);
if (nightly) tags.push(nightly);

// anything to publish
if (tags.length) {
  Deno.writeTextFileSync(
    `${baseDir}/.github/synchronet-version-reference.json`,
    JSON.stringify(ref, null, 2)
  );
  await tagAndPublish(tags);
}
