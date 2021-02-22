import fetch from "node-fetch";

/**
 * Determine if a specific tag already exists in bbs-io/synchronet repository
 *
 * @param {string} tag - The specific tag to check for
 * @returns {Promise<boolean>}
 */
export default async (tag) => {
  const data = await fetch(
    `https://api.github.com/repos/bbs-io/synchronet-docker/git/matching-refs/tags/${tag}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    }
  ).then((r) => r.json());

  // Interrested in .ref and .object.sha
  const refs = data
    .map((r) => ({ release: r.ref.split("/").pop(), hash: r.object.sha }))
    .sort((a, b) => (a.release < b.release ? 1 : -1));

  // has an exact match
  return !!refs.filter((r) => r.release === tag).length;
};
