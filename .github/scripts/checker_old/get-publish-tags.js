// Prints ENVIRONMENT variables for SBBS_TAGNAME and DOCKER_TAGS
import fs from "fs";

function main() {
  const GITHUB_REF = process.env.GITHUB_REF;
  const fn = `${__dirname}/synchronet-version-reference.json`;
  try {
    const { release, nightly } = JSON.parse(fs.readFileSync(fn, "utf8"));
    let sbbs;
    let docker = [];

    if (GITHUB_REF.indexOf(`nightly-`) >= 0) {
      sbbs = nightly.tag;
      docker.push(`nightly`, `nightly-${nightly.name}`);
    }
    if (GITHUB_REF.indexOf(`release-`) >= 0) {
      const parts = /^sbbs(\d+?)(\d{2})([a-z])$/.exec(release.name);
      if (!parts || parts.length < 4) return;

      sbbs = release.tag;
      docker.push(
        `latest`,
        `${parts[1]}`,
        `${parts[1]}.${parts[2]}`,
        `${parts[1]}.${parts[2]}${parts[3]}`
      );
    }

    if (sbbs && docker) {
      const dockertags = docker
        .map((tag) => `bbsio/synchronet:${tag}`)
        .join(",");

      console.log(`SBBS_TAGNAME=${sbbs}`);
      console.log(`DOCKER_TAGS=${dockertags}`);

      console.log(`::set-output name=sbbs_tagname::${sbbs}`);
      console.log(`::set-output name=docker_tags::${dockertags}`);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
