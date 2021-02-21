import fetch from "node-fetch";
import cheerio from "cheerio";

export default async () => {
  const $ = cheerio.load(
    await fetch(
      `https://gitlab.synchro.net/main/sbbs/-/tags?search=sbbs`
    ).then((r) => r.text())
  );

  const tags = $(".tags li");
  for (const el of tags) {
    const release = $("a.item-title", el).text();
    const hash = $("a.commit-sha", el).attr("href").split("/").pop();

    if (/^sbbs\d+[a-z]$/.test(release)) {
      return { release, hash };
    }
  }
};
