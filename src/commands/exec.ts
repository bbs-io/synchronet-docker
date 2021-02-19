import docker from "@tracker1/docker-cli";
import isRunning from "../utils/is-sbbs-running";

export default async (...args: string[]) => {
  if (!isRunning) {
    console.error("sbbs is not running");
    process.exit(1);
  }
  await docker(`exec sbbs ${args.map((a) => `"${a}"`).join(" ")}`);
};
