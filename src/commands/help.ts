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
                    sbbs run bash -c "ls /sbbs/ctrl"
  access      Fix file permissions for ~/sbbs/*
                Do this before editing content.

Runtime Commands:
  exec        Run a command inside the installed container
                ex: sbbs run jsexec /sbbs/mods/foo.js
  scfg        Load scfg
  bash        Bash prompt in container
  dos         (TODO) DOSEMU prompt in container

  logs        Fetch the logs of a container
              Usage: synchronet logs [OPTIONS]

              Options:
                    --details       Show extra details provided to logs
                -f, --follow        Follow log output
                    --since string  Show logs since timestamp 
                                    (e.g. 2013-01-02T13:23:37Z) 
                                    or relative (e.g. 42m for 42 minutes)
                -n, --tail string   Number of lines to show from the end of 
                                    the logs (default "all")
                -t, --timestamps    Show timestamps
                    --until string  Show logs before a timestamp 
                                    (e.g. 2013-01-02T13:23:37Z) or 
                                    relative (e.g. 42m for 42 minutes)
`);
};
