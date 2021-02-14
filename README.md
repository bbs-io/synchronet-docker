# Synchronet Dockerized

This is meant to be run from a unix-like (bash) environment.

Docker and a recent Docker Compose version should be installed.
If you are using Windows, you should install WSL2, and use Docker
Desktop configured to use WSL2, and it would be best to run this
from a WSL2 linux environment such as Ubuntu 20.04.

If you are using mac, you should modify the dockerfile to use a
volume container in docker (instructions out of scope).

## Installation

Instructions below are using git to clone this repository, but you
can instead download a zip version and extract directly to
`~/sbbs/synchronet-docker` instead.

```
mkdir -p ~/sbbs
cd ~/sbbs
git clone https://github.com/bbs-io/synchronet-docker.git synchronet-docker
```

Add `~/sbbs/synchronet-docker/scripts` to your `PATH` environment variable,
then run:

```
sbbs-install
```

## Scripts

- `sbbs-install` - will run docker-compose to create the instance, this will initialize the `~/sbbs/*` directories as volume mounts.
- `sbbs-restart` - will stop/start services
- `sbbs-upgrade` - will build a new sbbs image (latest git version) and start it.
- `sbbs-run COMMAND ...args` - will create a new temporary container, with volumes mounted, to execute a given command
- `sbbs-access` - will ensure read-write access to volume containers and related files. (run this if you're having issues editing files/folders under `~/sbbs`)

### Scripts for running SBBS instance.

The following scripts require that sbbs be installed/running in the `sbbs` docker container.

- `sbbs-exec command ...args` - will run the command and arguments inside the `sbbs` container.
- `sbbs-scfg` - will run scfg inside the container
- `sbbs-bash` - will run bash inside the sbbs container
- `sbbs-dos` (TODO) - will run DOSEMU with the appropriate directories mounted. This will help enable you to setup/configure DOS based doors.

## Directories

NOTE: Volume mounted directories will be owned by root as a default. In order to edit/update these files, you should run `sbbs-access` with the `sbbs` container running
