import exec from "../utils/exec";

export default async (...args: string[]) => {
  await exec(`docker logs ${args.map((a) => `"${a}"`).join(" ")} sbbs`);
};
