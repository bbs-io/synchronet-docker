import exec from "../utils/exec";
import init from "./init";
import uninstall from "./uninstall";

export default async () => {
  await uninstall();
  await init();
  exec("docker-compose up -d");
};
