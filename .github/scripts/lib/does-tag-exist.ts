/**
 * Determine if a specific tag already exists in bbs-io/synchronet repository
 */
export async function doesTagExist(tag: string) {
  const headers = {
    Accept: "application/vnd.github.v3+json",
  };
  const data = await fetch(
    `https://api.github.com/repos/bbs-io/synchronet-docker/git/matching-refs/tags/${tag}`,
    {
      headers,
    }
  ).then((r) => r.json());

  // Interrested in .ref and .object.sha
  const refs = data
    .map((r) => ({ release: r.ref.split("/").pop(), hash: r.object.sha }))
    .sort((a, b) => (a.release < b.release ? 1 : -1));

  // has an exact match
  return !!refs.filter((r) => r.release === tag).length;
}
