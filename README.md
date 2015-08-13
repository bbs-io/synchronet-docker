# WORK IN PROGRESS - THIS PACKAGE, AND RELATED IMAGES ARE NOT YET STABLE

# Synchronet BBS (Dockerized)

This project is for creating a [Synchronet BBS Software](http://www.synchro.net/) setup that will run inside of a docker container, as well as utility scripts for better Dockerization.

This will be is based on Ubuntu and will have Node/io.js installed for resource scripts.  It will also be pre-configured to support dosemu for dos based doors.


## Setup 

You should always run/exec anything within a synchronet-docker container instance with a volume mount for `/sbbs` so that data and configuration can be preserved.

This section will be expanded as I work through setup and configuration.  For now, it will be necessary to run bash inside the container instance to run what you want.

### Warnings

The container/scripts are not designed to upgrade from versions of synchronet prior to the first version of synchronet-docker on 2015-08-13.  Be careful copying configuration from another setup/installation.

The container will build from CVS, Images will be posted to dockerhub as `tracker1/synchronet@X.Y.Z` Where the `X.Y` os the major/minor version (ie: `3.6`) and `Z` is the date-time that the build from CVS started at UTC (ie: `201508031225`) in `yyyyMMddHHmm` format.


## Why Node?

There are several reasons why I'm writing the scripts for this system in Node/JavaScript:
 
* Synchronet uses JavaScript as its' own scripting engine
* JavaScript is widely known and used
* I know JS/Node



## SBBS Scripts

The `sbbs-scripts` directory will be added to the root of the container.  The this will be prepended to `$PATH` via `/root/.bashrc`.  Beyond this, some scripts will be exposed to ease setup/initialization.


## Technical Details


### Build Path

Synchronet itself will be checked out from CVS in `/sbbs-src` built from CVS to the `/sbbs-build` directory.


### Support Scripts

In order to support containerizing Synchronet, scripts from this project's `sbbs-scripts` directory will be copied into the image's `/sbbs-scripts` path.


### Init Script

`/sbbs-scripts/init` will be a catch-all for ensuring Synchronet is configured before executing.

It will do the following:

* Copy any missing directories from `/sbbs-build/*` to `/sbbs/*` excluding `/sbbs-build/bin`. (Use `/sbbs/mods` for custom bin/overrides).
* Set `$SBBSCTRL` to `/sbbs/ctrl` so that SBBS will execute based on the `/sbbs/` path.
* Run through setup/upgrades based on the installed version, and prior options in the `/sbbs` path.


### Container Configuration

There will be a file generated called `/sbbs/sbbs-docker-image.json` that will be used as a control file in order to handle current configuration details, as well as version upgrades moving forward.


### Dockerization

All of these technical details are so that the `/sbbs` path itself can be an external volume container, where the image itself will build/run inside the container, but beyond that, the data and configuration can be preserved, as well as providing a means for automated upgrades to newer versions of Synchronet as they present themselves.
