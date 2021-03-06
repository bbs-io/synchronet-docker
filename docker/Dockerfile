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

# Using node-stretch as baseline, to be able to use node based scripts.
FROM node:14-stretch as base

# Utilities & Runtime Pre-requisites
RUN (echo "deb http://ftp.au.debian.org/debian/ stretch contrib" > /etc/apt/sources.list.d/contrib.list) \
    && apt update \
    && apt upgrade -y \
    && apt install -yqq \
    curl wget ftp procps less zip unzip arj unrar-free p7zip-full \
    lhasa arc zoo logrotate libmozjs185-1.0 cron \
    build-essential git apt-utils nano libarchive-dev \
    libcap2-bin sudo openssh-client \
    && (apt install -yqq dosemu || echo "no dosemu available") \
    && cd /tmp \
    && (curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash) \
    && git config --global core.autocrlf false \
    && apt -y autoremove \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV TERM=xterm

# Node - Put node data in /sbbs/xtrn for persistance
ENV PATH=./node_modules/.bin:/sbbs/xtrn/_node/bin:$PATH
RUN npm config set prefix /sbbs/xtrn/_node --global \
    && npm config set cache /sbbs/xtrn/.cache/node --global

# Deno - Put deno data /sbbs/xtrn for persistance
ENV PATH=/root/.deno/bin:/sbbs/xtrn/_deno/bin:$PATH
ENV DENO_INSTALL="/root/.deno"
ENV DENO_DIR="/sbbs/xtrn/.cache/deno"
ENV DENO_INSTALL_ROOT="/sbbs/xtrn/_deno"
RUN echo "mkdir -p '/sbbs/xtrn/_deno'" >> ~/.bashrc \
    && curl -fsSL https://deno.land/x/install/install.sh | sh

#Build Stage
FROM base as build

ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec

# Build Deps
RUN apt-get update \
    && apt-get install -yqq libnspr4-dev libncurses5-dev libmozjs185-dev pkgconf \
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
    && make RELEASE=1 NO_X=1 JSINCLUDE=/usr/include/js JSLIB=mozjs185 SBBSDIR=/sbbs install

# Build Synchronet - Other executables (upgrade_*)
RUN cd ./src/sbbs3 \
    && make RELEASE=1 NO_X=1 JSINCLUDE=/usr/include/js JSLIB=mozjs185 SBBSDIR=/sbbs install

# capture hash and version
RUN (cd /sbbs/repo; echo "Git Hash $(git log -1 --format='%H')"> /sbbs/exec/version.txt) \
    && (echo "$(/sbbs/exec/sbbs version)" >> /sbbs/exec/version.txt)

RUN cp /sbbs/exec/node /sbbs/exec/sbbsnode \
    && mv /sbbs/ctrl /sbbs/ctrl.orig \
    && mv /sbbs/xtrn /sbbs/xtrn.orig \
    && mv /sbbs/web /sbbs/web.orig \
    && mv /sbbs/text /sbbs/text.orig \
    && cp -R /sbbs/node1 /sbbs/node.orig \
    && rm -rf /sbbs/node1 \
    && rm -rf /sbbs/node2 \
    && rm -rf /sbbs/node3 \
    && rm -rf /sbbs/node4 \
    && rm -rf /sbbs/3rdp /sbbs/src /sbbs/repo

# Copy utility scripts and run post-build script
COPY scripts /sbbs/scripts
RUN cd /sbbs/scripts \
    && npm ci \
    && chmod +x /sbbs/scripts/sbbs-* \
    && node -r esm /sbbs/scripts/post-build.js \
    && rm /sbbs/scripts/post-build.js


# Runtime Stage
FROM base as runtime

COPY --from=build /sbbs /sbbs

WORKDIR /sbbs/ctrl

# Environment variables for use
ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec
ENV PATH=$PATH:/sbbs/scripts:/sbbs/exec:


# Start SBBS by Default
CMD ["/sbbs/scripts/sbbs-start"]

# Declare expected volume mounts
VOLUME [ "/sbbs/data","/sbbs/ctrl","/sbbs/text","/sbbs/web","/sbbs/fido","/sbbs/xtrn","/sbbs/mods","/sbbs/nodes","/backup" ]

# Show version built
RUN cat /sbbs/exec/version.txt && echo ""