# Synchronet 3.19c

Date: 2023-04-25

In order to better facilitate continued operation of 3.19 while 3.20 is in
ongoing development, I've built and published a 3.19c image against the
[last commit](https://github.com/SynchronetBBS/sbbs/commit/a5de4b9c20a31888849c9a175faedab3e3e839d7)
before 3.20 was merged into the Synchronet master branch.

This will be the last tagged version expecting to mount under `/sbbs-data`.

```
docker build \
  --build-arg TAGNAME=a5de4b9c20a31888849c9a175faedab3e3e839d7 \
  --build-arg GH_TOKEN=$GH_TOKEN \
  --tag bbsio/synchronet:3.19c \
  --tag bbsio/synchronet:3.19 \
  --tag bbsio/synchronet:3 \
  .
```
