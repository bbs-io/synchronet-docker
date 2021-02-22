import fetch from "node-fetch";
import cheerio from "cheerio";

export const getLatest = async () => {
  const $ = await fetch(
    `https://gitlab.synchro.net/main/sbbs/-/tags?search=sbbs`
  )
    .then((r) => r.text())
    .then((t) => cheerio.load(t));

  const tags = $(".tags li");
  for (const el of tags) {
    const name = $("a.item-title", el).text();
    const hash = $("a.commit-sha", el).attr("href").split("/").pop();

    if (/^sbbs\d+[a-z]$/.test(name)) {
      return { name, hash, tag: name };
    }
  }
};

export const getLatestFromGithubMirror = async () => {
  const data = await fetch(
    "https://api.github.com/repos/SynchronetBBS/sbbs/git/matching-refs/tags/sbbs",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
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
};

export default getLatestFromGithubMirror;
