import fetch from "node-fetch";
import cheerio from "cheerio";

// default
export const getLatestNightlyFromGithubMirror = async () => {
  const data = await fetch(
    "https://api.github.com/repos/SynchronetBBS/sbbs/commits/dailybuild_linux-x64",
    // "https://api.github.com/repos/SynchronetBBS/sbbs/commits/master",
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
    }
  ).then((r) => r.json());

  const hash = data.parents[0].sha;
  const name = new Date(data.commit.author.date)
    .toJSON()
    .replace(/\D/g, "")
    .substr(0, 8);

  return { name, hash, tag: hash };
};

// reference
export const getLatestNightlyFromOfficial = async () => {
  const $ = await fetch(
    // Only successful nightlies are mirrored here
    "https://gitlab.com/SynchronetBBS/sbbs/-/commits/dailybuild_linux-x64/"
  )
    .then((r) => r.text())
    .then((t) => cheerio.load(t));

  const releaseDate = $("ol#commits-list li.commit-header .day").first().text();
  if (!releaseDate) return null;

  console.log(releaseDate);
  const name = new Date(releaseDate).toJSON().replace(/\D/g, "").substr(0, 8);

  const hashUrl = $(
    "ol#commits-list li.commits-row li.commit .commit-sha-group a"
  )
    .first()
    .attr("href");
  if (!hashUrl) return null;
  const hash = hashUrl.split("/").pop();

  if (name && hash) {
    return { name, hash, tag: hash };
  }
  return null;
};

export default getLatestNightlyFromGithubMirror;
