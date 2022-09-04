#!/usr/bin/env -S deno -q run --unstable --allow-run --allow-read --allow-write --allow-net --allow-env

import { cleanupOldNightlies } from "./lib/cleanup-old-nightlies.ts";
// import { getReleases } from "./lib/get-releases.ts";

console.log("Running check.ts");

await cleanupOldNightlies();

const { ref, release, nightly } = await getReleases();
console.log({ ref, release, nightly });
