import getLatestRelease from "./get-latest-release";
import getLatestNightly from "./get-latest-nightly";
import doesTagExist from "./does-tag-exists";

export default async function getReleases() {
  let release = await getLatestRelease();
  let nightly = await getLatestNightly();

  const r = (o) => (o && o.name ? `release-${o.name}` : null);
  const t = (o) => (o && o.name ? `nightly-${o.name}` : null);

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
