# Synchronet Dockerized

This is meant to be run from a unix-like (bash) environment.

Docker and a recent Docker Compose version should be installed.

## IN PROGRESS

This is a work in progress, I've manually published to docker up for `bbsio/synchronet` for the container, as well as have manually published version 0.1.0 to npm for `@bbs/synchronet` npm package.

### Windows

If you are using Windows, you should install WSL2, and use Docker
Desktop configured to use WSL2, and it would be best to run this
from a WSL2 linux environment such as Ubuntu 20.04.

### Mac

If you are using mac, you should modify the dockerfile to use a
volume container in docker (instructions out of scope).

## Installation

### docker-compose

If you wish to use `docker-compose` refer to [docker-compose.md](./docker-compose.md)

### npm

You will need a recent LTS version of [Node.js](https://nodejs.org/en/) _(14.x)_ installed in order to use the npm package.

This package will use `~/sbbs` as the base for volume mounts. As stated above
you should have docker and docker-compose installed in order to run this package.

The container name will be `sbbs` and the image will be `bbsio/synchronet:local`

```
npm i -g @bbs/synchronet
synchronet install
```

## Management Commands

- `synchronet help` - Display Help
- `synchronet init` - Initialize Setup - does not install container (creates `~/sbbs/*`)
- `synchronet install` - Initialize and install/upgrade container
- `synchronet uninstall` - Uninstall container - does not clear ~/sbbs
- `synchronet run PROGRAM [...args]` - Run command inside a temporary container
- `synchronet access` - Fix file permissions for `~/sbbs/*`. Do this before editing content.

### Runtime Commands

The following commands require that sbbs be installed/running in the `sbbs` docker container.

- `synchronet exec PROGRAM [...args]` - Run a command inside the installed container
- `synchronet scfg` - Load scfg
- `synchronet bash` - Bash prompt in container
- `synchronet dos` - (TODO) DOSEMU prompt in container

## Directories

NOTE: Volume mounted directories will be owned by root as a default. In order to edit/update these files, you should run `synchronet access` with the `sbbs` container running.
