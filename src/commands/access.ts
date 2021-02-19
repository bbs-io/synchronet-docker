/**
 * Reset read/write values on everything in ~/sbbs so items can be
 * edited/removed without issue
 */
import fs from "fs";
import mkdirp from "mkdirp";
import docker from "@tracker1/docker-cli";
import sbbsdir from "../utils/sbbsdir";

export default async () => {
  if (!fs.existsSync(sbbsdir)) return;
  await mkdirp(sbbsdir);
  await docker(
    `run -i --rm -v "${sbbsdir}:/sbbs" node:14 bash -c "chmod -R a+rwX /sbbs"`
  );
};
