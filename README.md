# Synchronet Dockerized

This is meant to be run from a unix-like (bash) environment.

This package will use `~/sbbs` as the base for data/configuration.

## IN PROGRESS

This is a work in progress, I've manually published to docker up for `bbsio/synchronet` for the container, as well as have manually published version 0.1.0 to npm for `@bbs/synchronet` npm package.

## Installation

You must have the following installed in order to run this application.

- Docker
- Docker Compose
- [Node.js](https://nodejs.org/en/) _(14.x)_

The container name will be `sbbs` and the image will be `bbsio/synchronet:latest`

```
npm i -g @bbs/synchronet
synchronet install
```

### Windows

If you are using Windows, you should install WSL2, and use Docker
Desktop configured to use WSL2, and it would be best to run this
from a WSL2 linux environment such as Ubuntu 20.04.

### Mac

If you are using mac, you should modify the dockerfile to use a
volume container in docker (instructions out of scope).

### docker-compose

If you wish to use `docker-compose` refer to [docker-compose.md](./docker-compose.md)

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
- `synchronet logs [OPTIONS]` - See below

### Logs

Options:

- `--details` - Show extra details provided to logs
- `-f`, `--follow` - Follow log output
- `--since TIME` - Show logs since timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)
- `-n NUM`, `--tail NUM` - Number of lines to show from the end of the logs (default "all")
- `-t`, `--timestamps` - Show timestamps
- `--until TIME` - Show logs before a timestamp (e.g. 2013-01-02T13:23:37Z) or relative (e.g. 42m for 42 minutes)

## Directories

NOTE: Volume mounted directories will be owned by root as a default. In order to edit/update these files, you should run `synchronet access` with the `sbbs` container running.
