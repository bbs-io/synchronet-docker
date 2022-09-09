import { exec, baseDir } from "../deps.ts";

const getComment = (tags: string[]) => {
  let comment = "";
  tags.forEach((tag, i) => {
    if (i === 0) {
      comment += tag;
      return;
    }
    if (i + 1 === tags.length) {
      comment += ` and ${tag}`;
      return;
    }
    comment += `, ${tag}`;
  });
  return comment;
};

export async function tagAndPublish(tags: string[]) {
  const comment = getComment(tags);
  console.log(`Tagging: ${comment}`);

  const GITHUB_REF = Deno.env.get("GITHUB_REF");
  if (!GITHUB_REF) {
    // Exit if not running in Github Action
    console.log("Not runnign on Github, skipping git tags.");
    return;
  }

  Deno.chdir(baseDir);
  await exec(`git add ".github/synchronet-version-reference.json`);
  await exec(`git commit -m "${comment}"`);

  for (const tag of tags) {
    await exec(`git tag ${tag}`);
  }

  await exec(`git push origin --tags`);
}
