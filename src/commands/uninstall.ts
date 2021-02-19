import fs from "fs";
import exec from "../utils/exec";
import sbbsdir from "../utils/sbbsdir";

export default async () => {
  if (!(await fs.existsSync(sbbsdir))) return;
  process.chdir(sbbsdir);
  exec("docker-compose down -v -t 3");
};
