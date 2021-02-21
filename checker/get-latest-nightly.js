import fetch from "node-fetch";
import cheerio from "cheerio";

export default async () => {
  const $ = cheerio.load(
    await fetch(
      "https://gitlab.synchro.net/main/sbbs/-/commits/dailybuild_linux-x64"
    ).then((r) => r.text())
  );

  const rows = $("ol#commits-list li");
  let release;
  for (let r of rows) {
    const row = $(r);
    if (row.hasClass("commit-header")) {
      release = new Date(row.find(".day").text())
        .toJSON()
        .replace(/\D/g, "")
        .substr(0, 8);
      continue;
    }
    if (row.hasClass("commits-row")) {
      for (let c of row.find("li.commit")) {
        const commit = $(c);
        const success = commit.find("a.ci-status-icon-success");
        if (!success.length) continue;
        const hash = commit
          .find(".commit-sha-group a")
          .attr("href")
          .split("/")
          .pop();
        return { release, hash };
      }
    }
  }

  return null;
};
