# Sycnhronet Dockerized by BBS.io <https://github.com/bbs-io/synchronet-docker>

FROM iojs

ADD ./sbbs-scripts /sbbs-scripts
WORKDIR /sbbs-scripts

RUN /sbbs-scripts/build

ENV SBBSCTRL /sbbs/ctrl

CMD [ "/sbbs-scripts/start" ]