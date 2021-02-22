import fs from "fs";
let TAGNAME = process.env.TAGNAME || "master";

const getTagFor = (original) => {
  const m = original.match(/^(release|nightly)/);
  const key = m && m[0];

  if (!key) return original;
  try {
    const fp = `${__dirname}/../synchronet-version-reference.json`;
    const ref = JSON.parse(fs.readFileSync(fp, "utf8"));
    if (ref && ref[key] && ref[key].tag) {
      return ref[key].tag;
    }
  } catch (error) {
    // trap error - should only happen if the ref file is missing
  }
  return original;
};

console.log(getTagFor(TAGNAME));
