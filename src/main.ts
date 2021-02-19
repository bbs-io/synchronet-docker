import init from "./commands/init";
import install from "./commands/install";
import uninstall from "./commands/uninstall";
import run from "./commands/run";
import access from "./commands/access";
import logs from "./commands/logs";
import exec from "./commands/exec";
import scfg from "./commands/scfg";
import bash from "./commands/bash";
import dos from "./commands/dos";
import help from "./commands/help";

export default async () => {
  const [command, ...args] = process.argv.slice(2);
  switch ((command || "").toLowerCase()) {
    case "init":
      return init();
    case "install":
      return install();
    case "uninstall":
      return uninstall();
    case "run":
      return run(...args);
    case "access":
      return access();
    case "logs":
      return logs(...args);
    case "exec":
      return exec(...args);
    case "scfg":
      return scfg();
    case "bash":
      return bash();
    case "dos":
      return dos();
  }
  return help();
};
