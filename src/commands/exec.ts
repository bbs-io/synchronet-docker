import exec from "../utils/exec";
import isRunning from "../utils/is-sbbs-running";

export default async (...args: string[]) => {
  if (!isRunning) {
    console.error("sbbs is not running");
    process.exit(1);
  }
  if (!args.length) return;
  await exec(`docker exec -it sbbs ${args.map((a) => `"${a}"`).join(" ")}`);
};
