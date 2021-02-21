import fs from "fs";
import fetch from "node-fetch";
import cheerio from "cheerio";
import yaml from "yaml";

let count = 0;

const getContent = () =>
  fetch("https://wiki.throwbackbbs.com/doku.php?id=doorcode")
    .then((r) => r.text())
    .then((t) => cheerio.load(t));

const fetchDoorpartyCodesFresh = async () => {
  const $: cheerio.Root = await getContent();
  const data = [];
  const rows = $(".dw-content table tr");

  let current = null;
  rows.each(function () {
    const th = $("th", this);
    const td = $("td", this);
    if (th.length === 1 && td.length === 0) {
      current = { title: th.text(), doors: [] };
      data.push(current);
    }
    if (th.length) return; //skip other rows with headings
    if (td.length === 2) {
      if (!current) throw new Error("No current category exists.");
      const code = $(td[0]).text();
      const name = $(td[1]).text();
      count++;
      current.doors.push({ code, name });
    }
  });

  return data;
};

const getDoorPartyCodesCached = () =>
  yaml.parse(
    fs.readFileSync(`${__dirname}/../_res/doorparty.codes.yml`, "utf8")
  );

async function getDoorPartyCodes() {
  try {
    const ret = await fetchDoorpartyCodesFresh();
    return ret;
  } catch (error1) {
    try {
      const ret = getDoorPartyCodesCached();
      return ret;
    } catch (error2) {
      throw Object.assign(new Error("Unable to retreive door codes."), {
        innerErrors: [error1, error2],
      });
    }
  }
}

async function main() {
  const data = await fetchDoorpartyCodesFresh();
  if (count < 100) throw new Error("Expected door count to be over 100.");
  fs.writeFileSync(
    `${__dirname}/../_res/doorparty.codes.yml`,
    yaml.stringify(data),
    "utf8"
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(0);
  });
}

export default getDoorPartyCodes;
