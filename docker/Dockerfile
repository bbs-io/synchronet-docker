
################################################################################
# NAME bbs-io/synchronet
#
# BUILD ARGS
#   docker build --build-arg NAME=VALUE ...
#
#   REPURL
#       default: https://github.com/SynchronetBBS/sbbs.git
#                github mirror, which should be faster in build environment
#       upstream: use https://gitlab.synchro.net/main/sbbs.git
#   TAGNAME = specific tag/commit/branch to build from
#       default: dailybuild_linux-x64 - latest nightly for default REPOURL above
# ==============================================================================

# Using bullseye-slim as baseline, to be able to use node based scripts.
FROM debian:bullseye-slim as base

# RUN echo "Building on $(uname -m)"

# Build Arguments - GITHUB_TOKEN needed to determine current Deno version
ARG GITHUB_TOKEN
ARG DEBIAN_FRONTEND=noninteractive
ONBUILD ARG DEBIAN_FRONTEND=noninteractive

# Environment variables for use
ENV TERM=xterm
ENV DENO_DIR /sbbs/data/.deno
ENV DENO_INSTALL_ROOT=$DENO_DIR
ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec
ENV PATH=$DENO_INSTALL_ROOT/bin:$PATH:/sbbs/scripts:/sbbs/exec:


# Utilities & Runtime Pre-requisites
RUN (echo "deb http://deb.debian.org/debian/ bullseye main" > /etc/apt/sources.list.d/contrib.list) \
    && (echo "deb-src http://deb.debian.org/debian/ bullseye main" > /etc/apt/sources.list.d/contrib.list) \
    && (echo "deb http://deb.debian.org/debian/ bullseye testing" > /etc/apt/sources.list.d/contrib.list) \
    && (echo "deb-src http://deb.debian.org/debian/ bullseye testing" > /etc/apt/sources.list.d/contrib.list) \
    && (echo "deb http://deb.debian.org/debian/ bullseye contrib" > /etc/apt/sources.list.d/contrib.list) \
    && (echo "deb-src http://deb.debian.org/debian/ bullseye contrib" > /etc/apt/sources.list.d/contrib.list)

RUN apt-get update \
    && apt-get upgrade -yqq \
    && apt-get install -yqq \
    curl wget ftp openssh-client \
    nano less procps libcap2-bin \
    libarchive13 libarchive-tools \
    zip unzip arj unrar-free p7zip-full lhasa arc \
    libnspr4 sudo jq telnet \
    && cd /tmp \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Setup Scripts and BuildScripts directories and Download the latest Deno
COPY buildscripts/deno-download.sh /tmp/deno-download.sh
RUN chmod +x /tmp/deno-download.sh \
    && /tmp/deno-download.sh \
    && rm /tmp/deno-download.sh



################################################################################
# Build Stage
FROM base AS build

# Build dependencies
RUN apt-get update \
    && apt-get install -yqq \
    build-essential libarchive-dev git \
    libnspr4-dev libncurses5-dev python2 pkgconf \
    && cd /tmp \
    && (curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash) \
    && git config --global core.autocrlf false \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Shallow git checkout, adjusts TAGNAME for "nightly" or "release"
WORKDIR /sbbs/repo
ARG REPOURL=https://github.com/SynchronetBBS/sbbs.git
ARG TAGNAME=dailybuild_linux-x64
RUN echo "\n--------------------------------------------------------\nChecking out $TAGNAME\n" \
    && git init \
    && git remote add origin $REPOURL \
    && git fetch --depth 1 origin $TAGNAME \
    && git checkout FETCH_HEAD

# Build Synchronet - Install
RUN cd ./install \
    && sed -i.bak '/git/d' ./GNUmakefile \
    && make RELEASE=1 NO_X=1 SBBSDIR=/sbbs install

# Build Synchronet - Other executables (upgrade_*)
RUN cd ./src/sbbs3 \
    && make RELEASE=1 NO_X=1 SBBSDIR=/sbbs install


# Run post-build script
COPY buildscripts /sbbs/buildscripts
COPY scripts /sbbs/scripts
RUN chmod +x /sbbs/buildscripts/*
RUN chmod +x /sbbs/scripts/*
RUN /sbbs/buildscripts/post-build.sh
RUN rm -rf /sbbs/buildscripts


################################################################################
# Runtime Stage
FROM base AS runtime

COPY --from=build /sbbs /sbbs

WORKDIR /sbbs

# Start SBBS by Default
CMD ["/sbbs/scripts/sbbs"]

# Declare expected volume mounts
VOLUME [ "/sbbs-data" ]


# Output Version(s)
RUN echo "\n" && cat /sbbs/exec/version.txt && echo "\n"