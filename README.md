# Synchronet Dockerized

This repository is meant to build/push to [bbsio/synchronet on Docker Hub](https://hub.docker.com/repository/docker/bbsio/synchronet).

For the `@bbs/synchronet` utility, [click here](https://github.com/bbs-io/synchronet-docker-util)

**[Synchronet](http://wiki.synchro.net/)** is built from _[source](https://gitlab.synchro.net/main/sbbs)_ via _[bbs-io/synchronet-docker on github](https://github.com/bbs-io/synchronet-docker)_.

### Windows Users

If you are running Windows, it is recommended that you first install WSL2, then Docker Desktop, configured for WSL2 and doing your volume mounts from inside WSL2 (such as with Ubuntu). VS Code with WSL Remote extension will make editing much easier to work with. Note: you can access your WSL2 instances in explorer via `\\wsl$`. You may want to add your SBBS volume directory to your Quick access shortcuts.

## Running

You can reference the [docker-compose.yml](./docker-compose.yml) or use the [@bbs/synchronet](https://github.com/bbs-io/synchronet-docker-util) via npm.

### First run/install

For your first time running Synchronet (fresh install), you should prepare the directories for volume mounting.

```
sudo mkdir -p /sbbs/backup
sudo mkdir -p /sbbs/ctrl
sudo mkdir -p /sbbs/text
sudo mkdir -p /sbbs/web
sudo mkdir -p /sbbs/data
sudo mkdir -p /sbbs/fido
sudo mkdir -p /sbbs/xtrn
sudo mkdir -p /sbbs/mods
sudo mkdir -p /sbbs/nodes
sudo chmod a+rwX /sbbs
```

### Pulling updates

If upgrading from a previous run, you should pull the latest release.

```
docker pull bbsio/synchronet:latest
```

### Running Synchronet

From here, you can start sbbs:

```
docker run -d --restart=unless-stopped \
  --name sbbs \
  -h sbbs \
  -v /sbbs/backup:/backup
  -v /sbbs/ctrl:/sbbs/ctrl
  -v /sbbs/text:/sbbs/text
  -v /sbbs/web:/sbbs/web
  -v /sbbs/data:/sbbs/data
  -v /sbbs/fido:/sbbs/fido
  -v /sbbs/xtrn:/sbbs/xtrn
  -v /sbbs/mods:/sbbs/mods
  -v /sbbs/nodes:/sbbs/nodes
  bbsio/synchronet:latest
```

## Shutting Down

To shut down and remove an existing instance, such as before running a new version.

```
docker rm --force sbbs
```

## Editing Content

If you are wanting to edit/update files, you may want to run the following on your common shared path, as files are created as root within the container.

```
sudo chmod a+rwX /sbbs
```

alternatively:

```
docker exec -it sbbs sbbs-access
```

## Volumes

In order to better support portability, the following volume mounts are expected. Most directories will be populated on first run.

- `/backup` - location in order to generate/create backup scripts inside the container.
  - `/defaults` - updated on first run, or updated versions, will container default directories from `/sbbs/` for reference.
- `/sbbs/ctrl` - note: `text.dat` will be overwritten on updated versions.
- `/sbbs/text`
- `/sbbs/web` - not populated, copy files from `/backup/defaults/web-ecweb4` or `/backup/defaults/web-runemaster`
- `/sbbs/data`
- `/sbbs/fido`
- `/sbbs/xtrn` - external programs, will populate directories that don't exist on first run or update
- `/sbbs/mods` - your customizations, empty by default
- `/sbbs/nodes` - shared nodes directory, not required if a single host is used.

## Ports

Synchronet is preconfigured for the following services/ports, see `/sbbs/ctrl/sbbs.ini` and `/sbbs/ctrl/services.ini` for additional configuration.

- `80` - http
- `443` - https
- `1123` - ws-term - used for ftelnet virtual terminal web connections
- `11235` - wss-term - used for ftelnet virtual terminal web connections
- `21` - ftp
- `22`- ssh
- `23` - telnet
- `513`- rlogin
- `64` - petscii 40-column
- `128` - petscii 128-column
- `25` - smtp-mail
- `587` - smtp-submit
- `465` - smtp-submit+tls
- `110` - pop3
- `995` - pop3+tls
- `119` - nntp
- `563` - nntps
- `18` - message send prot
- `11` - active user svc
- `17` - qotd
- `79` - finger
- `6667` - irc

Other services/ports that may be enabled:

- `5500` - hotline
- `5501` - hotline-trans
- `24554` - binkp
- `24553` - binkps
- `143` - imap
- `993` - imap+tls
