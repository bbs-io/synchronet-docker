# WORK IN PROGRESS - THIS PACKAGE, AND RELATED IMAGES ARE NOT YET STABLE

# Synchronet BBS (Dockerized)

This project is for creating a [Synchronet BBS Software](http://www.synchro.net/) setup that will run inside of a docker container, as well as utility scripts for better Dockerization.

This it is based on Debian Jesse (iojs) and will have Node/io.js installed for resource scripts.  It is also be configured for dosemu for dos based doors.


## Setup 

This section will be expanded as I work through setup and configuration.  For now, it will be necessary to run bash inside the container instance to run what you want.


### install

You should create a directory of `sbbs` and use that as a volume for your running container.   The commands below will create a directory under your current user's profile, then use that as the `/sbbs` path inside the container. 

```
cd ~/

mkdir sbbs

docker run --name=sbbs -v $(pwd)/sbbs:/sbbs -v $(pwd)/ tracker1/sbbs &
```

From here, you should connect to a bash prompt in the container to run `sbbs-init` inside the container, and then you can use `scfg -iD`.

----

**WARNING** For now, this only runs a loop that doesn't do anything, it allows the container to stay running so you can `EXEC` a bash prompt.


### sbbs-bash

In order to connect to a bash prompt in the running container, for the purpose of configuration, or other adjustments, you will want to use the following command.  You may want to create an alias in your `~/.bashrc` in your host environment.

```
docker exec -it sbbs bash
```

The following environment changes are added to the bash prompt.

* `/sbbs-scripts` is added to the path
* `/sbbs/exec` is added to the path
* `/sbbs-base/exec` is added to the path
* `$SBBSCTRL` is set to `/sbbs/ctrl` path

You should run `sbbs-init` the first time you connect to bash, before running any other commands to ensure the environment is properly configured.


### scfg

You should use `scfg -iD` which will use plain text prompts instead of the interactive UI, which works better inside a container.


### Warnings

The container/scripts are not designed to upgrade from versions of synchronet prior to the first version of synchronet-docker on 2015-08-13.  Be careful copying configuration from another setup/installation.

The container will build from CVS, Images will be posted to dockerhub as `tracker1/synchronet@X.Y.Z` Where the `X.Y` os the major/minor version (ie: `3.6`) and `Z` is the date-time that the build from CVS started at UTC (ie: `201508031225`) in `yyyyMMddHHmm` format.


## Why Node?

There are several reasons why I'm writing the scripts for this system in Node/JavaScript:
 
* Synchronet uses JavaScript as its' own scripting engine
* JavaScript is widely known and used
* I know JS/Node


## Technical Details


### Build Path

Synchronet itself will be checked out from CVS in `/sbbs-src` built from CVS to the `/sbbs-build` directory.


### Support Scripts

In order to support containerizing Synchronet, scripts from this project's `sbbs-scripts` directory will be copied into the image's `/sbbs-scripts` path.


### Init Script

`/sbbs-scripts/init` will be a catch-all for ensuring Synchronet is configured before executing.

It will do the following:

* Copy any missing directories from `/sbbs-build/*` to `/sbbs/*` excluding `/sbbs-build/bin`.
  * `/sbbs/mods`, if missing will be initialized with any Baja and JavaScript scripts.  
* Set `$SBBSCTRL` to `/sbbs/ctrl` so that SBBS will execute based on the `/sbbs/` path.
* Run through setup/upgrades based on the installed version, and prior options in the `/sbbs` path.


### Container Configuration

There will be a file generated called `/sbbs/sbbs-docker-image.json` that will be used as a control file in order to handle current configuration details, as well as version upgrades moving forward.


### Dockerization

All of these technical details are so that the `/sbbs` path itself can be an external volume container, where the image itself will build/run inside the container, but beyond that, the data and configuration can be preserved, as well as providing a means for automated upgrades to newer versions of Synchronet as they present themselves.
