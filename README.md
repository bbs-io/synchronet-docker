# Synchronet BBS (Dockerized)

This project is for creating a [Synchronet BBS Software](http://www.synchro.net/)
setup that will run inside of a docker container, as well as utility scripts for
better Dockerization.

This it is based on Debian Stretch and will have Node 14 installed for resource
scripts. It is also configured to support dosemu for dos based doors.

## Setup

Note: if you're migrating from an existing instance, you should copy the
following directories before running `sbbs-init`

- `~/sbbs/ctrl`
- `~/sbbs/data`
- `~/sbbs/fido`
- `~/sbbs/xtrn`
- `~/sbbs/mods`
- `~/sbbs/text`
- `~/sbbs/web`

First setup/installation:

```sh
./sbbs-build
./sbbs-run sbbs-init
./sbbs-run scfg
./sbbs-service-install -p 2323:23 -p 8023:80
```

NOTE: If you want to re-run full initialization, you should delete `version.txt` from the `/sbbs/ctrl` directory. This will update the `xtrn` and `text` volumes.

### Ports

The `sbbs-service-install` script will not expose/passthrough any ports by default, you should specify any ports you want to pass from the host environment into the container with `-p HOSTPORT:SBBSPORT` ... see: `ctrl/sbbs.ini` and `ctrl/services.ini` for a full list of what ports may be in use.

## Logs

To view logs, use:

```
docker logs sbbs
```

If you wish to actively follow logs:

```
docker logs -f sbbs
```

## Helper Scripts

The `sbbs-*` scripts are for guidance, they are set with sane defaults to make
it easier to build, initialize and run Synchronet on your system. These scripts
are configured to use a Docker network called `sbbs` and a container/instance
called `sbbs`. The scripts assume you will use volume mounts from `~/sbbs` for
use with the running instance/container.

- `sbbs-build` will build the Dockerfile tagged as `sbbs`
- `sbbs-run` will run a fresh interactive terminal against the image in a new instance.
- `sbbs-exec` will run against an installed/running instance (ex: `./sbbs-exec scfg` or `./sbbs-exec bash`)
- `sbbs-service-install` will create a restarting container instance for Synchronet
- `sbbs-service-remove` will stop/destroy/remove the Synchronet container/instance.

## scfg

If you have an installed-running instance, you should execute scfg inside the existing container with `./sbbs-exec scfg`, if you haven't installed the service instance yet, or have stopped the service instance `./sbbs-run scfg` will work (run `./sbbs-run sbbs-init` if you don't have a ctrl directory setup as of yet.)

## sbbs-scripts

The `sbbs-scripts` directory is copied into `/sbbs/scripts` and will be
included in the path inside the container environment.

- `sbbs-start` will initialize sbbs `init.js` and start the sbbs service.
- `sbbs-init` will run the `init.js` script and not start sbbs, this is so that you can follow with `scfg` before installing the service instance. NOTE: this will also add `+rw` permissions to volume directories... since the instance will create files as root, this should allow non-root users outside containers access.

## text.dat

When a version updates, `text.dat` will be backed up and overwritten with the
default. You best bet is to replace specific lines in your own modules.

## Additional Notes:

The `references` volume will recieve a fresh copy of `exec`, `docs`, `web` and `text` on install/upgrade. These will make it easier to access materials that are in-container.

The `web` and `text` directories will only be populated if they are empty.

The `xtrl` files will be overwritten from source files on install/upgrade. You may wish to use a different volume mount, or other directory names under xtrn for additional external programs/doors.

When the service runs, or sbbs-init is run, there will be a check/update of a `ctrl/version.txt` file, this is based on the Version from `sbbs -v` so development updates may not automatically update `xtrn` and `ctrl/text.dat`, if need be, delete `ctrl/version.txt`
