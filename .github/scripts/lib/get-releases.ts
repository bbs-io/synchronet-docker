import { getLatestRelease } from "./get-latest-release.ts";
import { getLatestNightly } from "./get-latest-nightly.ts";
import { doesTagExist } from "./does-tag-exist.ts";

export async function getReleases() {
  const release = await getLatestRelease();
  const nightly = await getLatestNightly();

  const r = (o) => (o && o.name ? `release-${o.name}` : "");
  const t = (o) => (o && o.name ? `nightly-${o.name}` : "");

  let hasRelease = true;
  if (release && release.name && (await doesTagExist(r(release)))) {
    hasRelease = false;
  }

  let hasNightly = true;
  if (nightly && nightly.name && (await doesTagExist(t(nightly)))) {
    hasNightly = false;
  }

  return {
    ref: { release, nightly },
    release: r(hasRelease && release),
    nightly: t(hasNightly && nightly),
  };
}
