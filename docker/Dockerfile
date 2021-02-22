# NAME bbs-io/synchronet
# VERSION 3.18

# BUILD ARGS
#   docker build --build-arg NAME=VALUE ...
#
#   REPURL
#       default: github mirror, which should be faster in build environment
#       upstream: use https://gitlab.synchro.net/main/sbbs.git
#   TAGNAME = specific tag/commit/branch to build from
#       default: master - latest nightly for default REPOURL above
#       release*: latest release from synchronet-version-reference.json
#       nightly*: latest nightly from synchronet-version-reference.json

# Using node-stretch as baseline, to be able to use node based scripts.
FROM node:14-stretch as BASE

# Utilities & Runtime Pre-requisites
RUN echo "deb http://ftp.au.debian.org/debian/ stretch contrib" > /etc/apt/sources.list.d/contrib.list
RUN apt-get update \
    && apt-get install -yqq \
    curl wget procps less zip unzip arj unrar-free \
    lhasa arc zoo logrotate libmozjs185-1.0 cron \
    dosemu build-essential git apt-utils nano \
    libcap2-bin sudo \
    && cd /tmp \
    && (curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash) \
    && git config --global core.autocrlf false \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#Build Stage
FROM BASE as BUILD

ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec

# Build Deps
RUN apt-get update \
    && apt-get install -yqq libnspr4-dev libncurses5-dev libmozjs185-dev pkgconf \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Prepare scripts directory
WORKDIR /sbbs/scripts
COPY ./synchronet-version-reference.json /sbbs/synchronet-version-reference.json
COPY ./scripts .
RUN npm ci \
    && chmod +x /sbbs/scripts/sbbs-*

# Shallow git checkout, adjusts TAGNAME for "nightly" or "release"
WORKDIR /sbbs/repo
ARG REPOURL=https://github.com/SynchronetBBS/sbbs.git
ARG TAGNAME=master
RUN export TAGNAME="$(cd /sbbs/scripts; node -r esm ./get-tag.js)" \
    && echo "\n--------------------------------------------------------\nChecking out $TAGNAME\n" \
    && git init \
    && git remote add origin $REPOURL \
    && git fetch --depth 1 origin $TAGNAME \
    && git checkout FETCH_HEAD \
    && rm /sbbs/scripts/get-tag.js

# Build Synchronet
RUN cd ./install \
    && sed -i.bak '/git/d' ./GNUmakefile \
    && make RELEASE=1 USE_DOSEMU=1 NO_X=1 JSINCLUDE=/usr/include/js JSLIB=mozjs185 SBBSDIR=/sbbs install

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
    && node -r esm /sbbs/scripts/post-build.js \
    && rm /sbbs/scripts/post-build.js

# Runtime Stage
FROM BASE as RUNTIME

COPY --from=BUILD /sbbs /sbbs

# Environment variables for use
ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec
ENV PATH=$PATH:/sbbs/scripts:${SBBSEXEC}

WORKDIR /sbbs/ctrl

# Start SBBS by Default
CMD ["/sbbs/scripts/sbbs-start"]

# Declare expected volume mounts
VOLUME [ "/sbbs/data","/sbbs/ctrl","/sbbs/text","/sbbs/web","/sbbs/fido","/sbbs/xtrn","/sbbs/mods","/sbbs/nodes","/backup" ]

# Show version built
RUN cat /sbbs/exec/version.txt && echo ""