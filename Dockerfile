# Sycnhronet Dockerized by BBS.io <https://github.com/bbs-io/synchronet-docker>

FROM iojs

ADD ./sbbs-scripts /sbbs-scripts

RUN /sbbs-scripts/sbbs-build && rm /sbbs-scripts/sbbs-build

ENV SBBSCTRL /sbbs/ctrl

CMD [ "/sbbs-scripts/sbbs-start" ]