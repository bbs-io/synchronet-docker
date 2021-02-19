import fs from "fs";
import exec from "../utils/exec";
import sbbsdir from "../utils/sbbsdir";
import resetAccess from "./access";

export default async () => {
  if (!(await fs.existsSync(`${sbbsdir}/docker-compose.yml`))) return;
  process.chdir(sbbsdir);
  exec("docker-compose down -v -t 3");
  await resetAccess();
};
