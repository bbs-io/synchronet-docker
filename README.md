# Synchronet BBS Software

## README - WARNING

The current `:latest`, `:3.19b`, `:3.19`, `:3` tags are Intel only. There was an
issue with the build configuration that optimized for modern Intel instructions
that break on Ryzen and possibly older Intel CPUs. If this doesn't run for you,
you should stick to `3.18b` or move to a nightly release (once fixed).

### 2022-04-30

Updated image builds, should work for nightly as of today, for AMD Ryzen as well
as Intel.

**Breaking change** - You now only need to mount a single directory `.` to
`/sbbs-data`, if you were using the example docker-compose, you should be able
to simply switch out the volume path(s) for a single entry. If you are
overriding the web directory, you should still mount this as `mydir:/sbbs/web`
which will work properly inside the container.

`/sbbs/scripts/sbbs` - will appear higher in the PATH statement before
`/sbbs/exec/sbbs` this is intentional as it will run the initialization process
before starting, this will appropriately link the directories in question from
`/sbbs-data` to `/sbbs` inside the runtime instance.

### 2022-04-26

Working on updating the build and release scripts, this will change the
behaviors slightly, but should mean a more clear setup/configuration and require
less volume mounts for persistence. Hoping to have an update in the next few
days, will update the date above as/if it changes.

### 2022-02-22

If you are using `:latest` from before 2022-02-22, it was a bleeding edge build
from the mainline repository, you should change to `:nightly`\*

---

**[Synchronet](http://wiki.synchro.net/)** is a modern bulletin board software
supporting classic terminal interfaces as well as modern web interfaces and
other services.

The [repository source](https://github.com/bbs-io/synchronet-docker/) is meant
to build/push to
[bbsio/synchronet on Docker Hub](https://hub.docker.com/repository/docker/bbsio/synchronet).
For the `@bbs/synchronet` utility,
[click here](https://github.com/bbs-io/synchronet-docker-util)

### Tags

- `:latest` - The latest stable release version (3.18b)
- `#`, `#.##`, `#.##x` - Major, Minor, Patch options
- `:nightly` - The latest nightly
- `:nightly-YYYYMMDD` - Specific nightly (ex: `nightly-20210222`)

### Windows Users

If you are running Windows, it is recommended that you first install WSL2, then
Docker Desktop, configured for WSL2 and doing your volume mounts from inside
WSL2 (such as with Ubuntu). VS Code with WSL Remote extension will make editing
much easier to work with. Note: you can access your WSL2 instances in explorer
via `\\wsl$`. You may want to add your SBBS volume directory to your Quick
access shortcuts.

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

If you are wanting to edit/update files, you may want to run the following on
your common shared path, as files are created as root within the container.

```
sudo chmod a+rwX ~/sbbs
```

or

```
docker exec -it sbbs sbbs-access
```

## Volumes

In order to better support portability, the following volume mounts are
expected. Most directories will be populated on first run.

- `/sbbs-data/` - All sbbs directories should be mounted under this path, they
  will be initialized if they do not already exist...
  - `backup/defaults/` - will be initialized with the default build for
    synchronet on first run, or upgrade.
  - `/ctrl` - note: `text.dat` will be overwritten on updated versions.
  - `/sbbs/text`
  - `/sbbs/web` - default populated from `/backup/defaults/web-ecweb4`
  - `data`
  - `fido`
  - `xtrn` - external programs, will populate directories that don't exist on
    first run or update
  - `mods` - your customizations, empty by default
  - `nodes/node{n}` - shared nodes directory

## Ports

Synchronet is preconfigured for the following services/ports, see
`/sbbs/ctrl/sbbs.ini` and `/sbbs/ctrl/services.ini` for additional
configuration.

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
- `6697` - irc+tls

## License

This project is ISC Licensed, Synchronet itself is mostly GPL.

<!-- Update: 2022-04-30 - restart automated builds -->
