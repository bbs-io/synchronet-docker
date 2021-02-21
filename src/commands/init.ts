import fs from "fs";
import mkdirp from "mkdirp";
import docker from "@tracker1/docker-cli";
import sbbsdir from "../utils/sbbsdir";
import resetAccess from "./access";
import getImageName from "../utils/get-image-name";
import isRunning from "../utils/is-sbbs-running";
import ensureDirs from "../utils/ensure-sbbsdirs";
import run from "./run";

export default async () => {
  console.log("Initializing Synchronet");

  // ensure directory access - create mount locations if not ready
  await resetAccess();

  // Change to sbbsdir
  await mkdirp(sbbsdir);
  process.chdir(sbbsdir);
  if (!fs.existsSync(`${sbbsdir}/docker-compose.yml`)) {
    await fs.copyFileSync(
      `${__dirname}/../_res/docker-compose.yml`,
      `${sbbsdir}/docker-compose.yml`
    );
  }

  if (!(await isRunning())) {
    // is there a container running
    // no - run sbbs-init, then run access again
    console.log("Initializing ~/sbbs");
    const imgName = await getImageName();
    await docker(`pull ${imgName}`);
    await ensureDirs();
    await run(`sbbs-init`);
    await await resetAccess();
  }
};
