#!/usr/bin/env -S deno -q run --unstable --allow-run --allow-read --allow-write --allow-net --allow-env

import { baseDir } from "./deps.ts";

// force workflow for now
const GITHUB_REF = Deno.env.get("GITHUB_REF") || "nightly-";

if (GITHUB_REF === "release-sbbs319b") {
  // don't publish this broken build release
  Deno.exit();
}

const { release, nightly } = JSON.parse(
  Deno.readTextFileSync(`${baseDir}/.github/synchronet-version-reference.json`)
);

let sbbs = "";
const tags: string[] = [];

if (GITHUB_REF.indexOf(`nightly-`) >= 0) {
  sbbs = nightly.tag;
  tags.push(`nightly`, `nightly-${nightly.name}`);
}

if (GITHUB_REF.indexOf("release-") >= 0) {
  const parts = /^sbbs(\d+?)(\d{2})([a-z])$/.exec(release.name);
  if (!parts || parts.length < 4) {
    // invalid tag for release
    Deno.exit();
  }
  sbbs = release.tag;
  tags.push(
    `latest`,
    `${parts[1]}`,
    `${parts[1]}.${parts[2]}`,
    `${parts[1]}.${parts[2]}${parts[3]}`
  );
}

if (sbbs && tags.length) {
  const dt = tags.map((t) => `bbsio/synchronet:${t}`).join(",");
  console.log(`SBBS_TAGNAME=${sbbs}`);
  console.log(`DOCKER_TAGS=${dt}`);
  console.log(`::set-output name=sbbs_tagname::${sbbs}`);
  console.log(`::set-output name=docker_tags::${dt}`);
}
