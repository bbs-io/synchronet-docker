# NAME bbs-io/synchronet
# VERSION 3.18

# Using node-stretch as baseline, to be able to use node based scripts.
FROM node:14-stretch as BASE

# Utilities & Runtime Pre-requisites
RUN echo "deb http://ftp.au.debian.org/debian/ stretch contrib" > /etc/apt/sources.list.d/contrib.list
RUN apt-get update \
    && apt-get install -yqq \
    curl wget procps less zip unzip arj unrar-free \
    lhasa arc zoo logrotate libmozjs185-1.0 cron \
    dosemu build-essential git apt-utils nano \
    && cd /tmp \
    && (curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash) \
    && git config --global core.autocrlf false \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

#Build Stage
FROM BASE as BUILD

# Build Deps
RUN apt-get install -yqq libnspr4-dev libncurses5-dev libmozjs185-dev pkgconf \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Build Synchronet - capture hash and version
ENV SBBSCTRL=/sbbs/ctrl
RUN cd /tmp \
    && wget https://gitlab.synchro.net/main/sbbs/-/raw/master/install/GNUmakefile \
    && make RELEASE=1 USE_DOSEMU=1 NO_X=1 JSINCLUDE=/usr/include/js JSLIB=mozjs185 SBBSDIR=/sbbs install

RUN (cd /sbbs/repo; echo "Git Hash $(git log -1 --format='%H')"> /sbbs/ctrl/version.txt) \
    && (echo "$(/sbbs/exec/sbbs version)" >> /sbbs/ctrl/version.txt) \
    && cd /sbbs \
    && cp /sbbs/exec/node /sbbs/exec/sbbsnode \
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
COPY container/sbbs/scripts /sbbs/scripts
RUN cd /sbbs/scripts \
    && chmod +x /sbbs/scripts/sbbs-* \
    && npm ci \
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

# TODO: Declare ports used