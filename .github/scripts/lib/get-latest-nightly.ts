export async function getLatestNightly() {
  const headers = {
    Accept: "application/vnd.github.v3+json",
  };
  const data = await fetch(
    "https://api.github.com/repos/SynchronetBBS/sbbs/commits/dailybuild_linux-x64",
    {
      headers,
    }
  ).then((r) => r.json());

  const hash = data.parents[0].sha;
  const name = new Date(data.commit.author.date)
    .toJSON()
    .replace(/\D/g, "")
    .substring(0, 8);

  return { name, hash, tag: hash };
}
