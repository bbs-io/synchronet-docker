# NAME bbs-io/synchronet
# VERSION 3.18

# Using node-stretch as baseline, to be able to use node based scripts.
FROM node:14-stretch

# Utilities & Pre-requisites
RUN echo "deb http://ftp.au.debian.org/debian/ stretch contrib" > /etc/apt/sources.list.d/contrib.list
RUN apt-get update \
    && apt-get install -yqq \
        curl wget procps less zip unzip arj unrar-free \
        lhasa arc zoo logrotate libmozjs185-1.0 cron \
        dosemu build-essential libnspr4-dev libncurses5-dev \
        libmozjs185-dev wget pkgconf git \
    && cd /tmp \
    && (curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash) \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Build Synchronet
RUN cd /tmp \
    && wget https://gitlab.synchro.net/main/sbbs/-/raw/master/install/GNUmakefile \
    && make RELEASE=1 USE_DOSEMU=1 NO_X=1 JSINCLUDE=/usr/include/js JSLIB=mozjs185 SBBSDIR=/sbbs install \
    && mv /sbbs/ctrl /sbbs/ctrl.orig \
    && mv /sbbs/xtrn /sbbs/xtrn.orig \
    && mv /sbbs/web /sbbs/web.orig \
    && mv /sbbs/text /sbbs/text.orig \
    && rm -rf /sbbs/3rdp /sbbs/src /sbbs/repo \
    && rm -rf /tmp/* /var/tmp/*

# Cleanup libraries for sbbs-build
RUN apt-get -y purge libnspr4-dev libncurses5-dev libmozjs185-dev pkgconf \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Copy utility scripts
COPY sbbs-scripts /sbbs/scripts
RUN cd /sbbs/scripts \
    && chmod +x /sbbs/scripts/sbbs-start \
    && npm ci

# Environment variables for use
ENV SBBSCTRL=/sbbs/ctrl
ENV SBBSEXEC=/sbbs/exec
ENV PATH=$PATH:/sbbs/scripts:${SBBSEXEC}

WORKDIR /sbbs/ctrl

# Start SBBS by Default
CMD ["/sbbs/scripts/sbbs-start"]

# Declare expected volume mounts
VOLUME [ "/sbbs/data","/sbbs/ctrl","/sbbs/text","/sbbs/web","/sbbs/fido","/sbbs/xtrn","/sbbs/mods","/sbbs/reference" ]

# Declare ports used