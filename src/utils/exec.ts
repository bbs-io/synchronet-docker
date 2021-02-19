import cp from "child_process";

export default (cmd: string, options: any = null) => {
  try {
    cp.execSync(cmd, { stdio: "inherit", env: process.env, ...options });
  } catch ({ status }) {
    process.exit(status);
  }
};
