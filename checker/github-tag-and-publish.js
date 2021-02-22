import exec from "./exec";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

export default async function tagAndPublish(tags) {
  let comment = "";
  tags.forEach((tag, i) => {
    if (i === 0) {
      comment += tag;
      return;
    }
    if (i === tags.length - 1) {
      comment += `and ${tag}`;
      return;
    }
    comment += `, ${tag}`;
  });

  console.log("Tagging: ", comment);

  // Stop if not inside a Github Action Worker
  if (!process.env.GITHUB_REF) return;

  process.chdir(`${__dirname}/../`);

  exec(`git add "checker/synchronet-version-reference.json"`);
  exec(`git commit -m "${comment}"`);

  tags.forEach((tag) => {
    exec(`git tag ${tag}`);
  });

  exec(`git push origin --tags`);
}
