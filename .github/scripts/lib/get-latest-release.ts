export async function getLatestRelease() {
  const headers = {
    Accept: "application/vnd.github.v3+json",
  };
  const data = await fetch(
    "https://api.github.com/repos/SynchronetBBS/sbbs/git/matching-refs/tags/sbbs",
    {
      headers,
    }
  ).then((r) => r.json());

  // Interrested in .ref and .object.sha
  const refs = data
    .map((r) => ({
      name: r.ref.split("/").pop(),
      hash: r.object.sha,
      tag: r.ref.split("/").pop(),
    }))
    .sort((a, b) => (a.name < b.name ? 1 : -1));

  // return latest/highest match
  return refs[0];
}
