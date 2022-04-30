# NAME bbs-io/synchronet
# VERSION 3.18

# BUILD ARGS
#   docker build --build-arg NAME=VALUE ...
#
#   REPURL
#       default: https://github.com/SynchronetBBS/sbbs.git
#                github mirror, which should be faster in build environment
#       upstream: use https://gitlab.synchro.net/main/sbbs.git
#   TAGNAME = specific tag/commit/branch to build from
#       default: dailybuild_linux-x64 - latest nightly for default REPOURL above

# Using bullseye-slim as baseline, to be able to use node based scripts.
FROM debian:bullseye-slim as base

ENV TERM=xterm

ARG DEBIAN_FRONTEND=noninteractive
ONBUILD ARG DEBIAN_FRONTEND=noninteractive

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
    libnspr4 sudo \
    && cd /tmp \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY --from=denoland/deno:bin /deno /usr/local/bin/deno


# Build Stage
FROM base AS build

ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec

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

# capture hash and version
RUN (cd /sbbs/repo; echo "Git Hash $(git log -1 --format='%H')"> /sbbs/exec/version.txt) \
    && (echo "$(/sbbs/exec/sbbs version)" >> /sbbs/exec/version.txt)

WORKDIR /sbbs/scripts
RUN cp /sbbs/exec/node /sbbs/exec/sbbsnode \
    && mkdir -p /sbbs/dist \
    && mv /sbbs/ctrl /sbbs/dist/ctrl \
    && mv /sbbs/docs /sbbs/dist/docs \
    && mv /sbbs/node1 /sbbs/dist/node1 \
    && mv /sbbs/text /sbbs/dist/text \
    && mv /sbbs/xtrn /sbbs/dist/xtrn \
    && mv /sbbs/web /sbbs/dist/web-runemaster \
    && mv /sbbs/webv4 /sbbs/dist/web-ecweb4 \
    && rm -rf /sbbs/node2 \
    && rm -rf /sbbs/node3 \
    && rm -rf /sbbs/node4 \
    && rm -rf /sbbs/3rdp \
    && rm -rf /sbbs/src \
    && rm -rf /sbbs/repo

# Copy utility scripts and run post-build script
COPY scripts /sbbs/scripts
RUN cd /sbbs/scripts \
    && chmod +x /sbbs/scripts/* \
    && /sbbs/scripts/post-build.ts \
    && rm /sbbs/scripts/post-build.ts

FROM base AS runtime

COPY --from=build /sbbs /sbbs

WORKDIR /sbbs

# Environment variables for use
ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec
ENV PATH=$PATH:/sbbs/scripts:/sbbs/exec:

# Cache dependencies for sbbs scripts
RUN deno cache --unstable /sbbs/scripts/*.ts

# Start SBBS by Default
CMD ["/sbbs/scripts/sbbs"]

# Declare expected volume mounts
VOLUME [ "/sbbs-data" ]

# Show version built
RUN cat /sbbs/exec/version.txt && echo ""
