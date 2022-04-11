# Synchronet BBS Software


## README - WARNING

2022-04-11

The nightly/daily build process has been broken (apparently for a few weeks) by an underlying update... working on a fix in the coming week.

Looks like the issue with 3.19 was fixed upstream... there was a build optimization on the github worker (intel) that was causing a bug running on AMD hardware.  If you are running a recent Intel CPU, this shouldn't affect you.  If you are using AMD, stick to 3.18b for now.

----

**[Synchronet](http://wiki.synchro.net/)** is a modern bulletin board software supporting classic terminal interfaces as well as modern web interfaces and other services.

This repository is meant to build/push to [bbsio/synchronet on Docker Hub](https://hub.docker.com/repository/docker/bbsio/synchronet).
For the `@bbs/synchronet` utility, [click here](https://github.com/bbs-io/synchronet-docker-util)

### Tags

- `:latest` - The latest stable release version (3.18b)
- `#`, `#.##`, `#.##x` - Major, Minor, Patch options
- `:nightly` - The latest nightly
- `:nightly-YYYYMMDD` - Specific nightly (ex: `nightly-20210222`)

**\*WARNING:** If you are using `:latest` from before 2022-02-22, it was a bleeding edge build from the mainline repository, you should change to `:nightly`\*

### Windows Users

If you are running Windows, it is recommended that you first install WSL2, then Docker Desktop, configured for WSL2 and doing your volume mounts from inside WSL2 (such as with Ubuntu). VS Code with WSL Remote extension will make editing much easier to work with. Note: you can access your WSL2 instances in explorer via `\\wsl$`. You may want to add your SBBS volume directory to your Quick access shortcuts.

## Docker Compose

The easiest way to get running is with docker-compose.

    mkdir ~/sbbs
    cd ~/sbbs
    wget -O docker-compose.yml https://raw.githubusercontent.com/bbs-io/synchronet-docker/master/docker-compose.yml
    docker-compose up -d
    sudo chmod -R a+rwX ./*

To shutdown:

    docker-compose down

To get a bash prompt inside the running container:

    docker exec -it sbbs bash

## Editing Content

If you are wanting to edit/update files, you may want to run the following on your common shared path, as files are created as root within the container.

```
sudo chmod a+rwX ~/sbbs
```

or

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

## License

This project is ISC Licensed, Synchronet itself is mostly GPL.

<!-- Update: 2021-10-04 - restart automated builds -->
