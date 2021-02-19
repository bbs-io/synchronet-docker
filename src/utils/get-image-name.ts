import YAML from "yaml";
import fs from "fs";
import sbbsdir from "./sbbsdir";

export default async () => {
  let dcf = `${sbbsdir}/docker-compose.yml`;
  if (!fs.existsSync(dcf)) {
    dcf = `${__dirname}/../../docker-compose.yml`;
  }
  const dc = await YAML.parse(fs.readFileSync(dcf, "utf8"));
  try {
    return dc?.services?.sbbs?.image;
  } catch (error) {
    return "bbsio/synchronet:latest";
  }
};
