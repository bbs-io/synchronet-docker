import cp from "child_process";

export default (cmd, options) => {
  try {
    cp.execSync(cmd, { stdio: "inherit", env: process.env, ...options });
  } catch ({ status }) {
    process.exit(status);
  }
};
