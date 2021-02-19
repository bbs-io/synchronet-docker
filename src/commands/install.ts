import exec from "../utils/exec";
import init from "./init";
import uninstall from "./uninstall";
import resetAccess from "./access";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default async () => {
  await uninstall();
  await init();
  exec("docker-compose up -d");
  console.log("Starting Synchronet (sbbs)");
  await delay(5000);
  await resetAccess();
};
