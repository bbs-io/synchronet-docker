export default async () => {
  console.log(`
Usage: synchronet COMMAND

  Synchronet BBS Software (containerized)

  Leverages docker and docker-compose
  
  Stores files/configuration under ~/sbbs

Management Commands:
  help        Display Help

  init        Initialize Setup - does not install container
  install     Initialize and install/upgrade container
  uninstall   Uninstall container - does not clear ~/sbbs
  run         Run command inside a temporary container
                ex: sbbs run bash
                    sbbs run ls /sbbs/ctrl
  access      Fix file permissions for ~/sbbs/*
                Do this before editing content.

Runtime Commands:
  exec        Run a command inside the installed container
                ex: sbbs run jsexec /sbbs/mods/foo.js
  scfg        Load scfg
  bash        Bash prompt in container
  dos         (TODO) DOSEMU prompt in container
`);
};
