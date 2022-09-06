#!/bin/bash

# codified changes
/sbbs/buildscripts/post-build.ts

# capture hash and version
 (echo "$(/sbbs/exec/sbbs version)" > /sbbs/exec/version.txt) \
    && (echo "" >> /sbbs/exec/version) \
    && (cd /sbbs/repo; echo "Git Hash $(git log -1 --format='%H')" >> /sbbs/exec/version.txt)

# cache runtime dependencies
mkdir -p "$DENO_DIR"
deno cache --unstable /sbbs/scripts/*.ts

# cleanup output to /sbbs/dist
cp /sbbs/exec/node /sbbs/exec/sbbsnode
mkdir -p /sbbs/dist
mv /sbbs/ctrl /sbbs/dist/ctrl
mv /sbbs/docs /sbbs/dist/docs
mv /sbbs/text /sbbs/dist/text
mv /sbbs/xtrn /sbbs/dist/xtrn
mv /sbbs/web /sbbs/dist/web-runemaster
mv /sbbs/webv4 /sbbs/dist/web-ecweb4
mv /sbbs/data /sbbs/dist/data
mv /sbbs/node1 /sbbs/dist/node1
rm -rf /sbbs/node2
rm -rf /sbbs/node3
rm -rf /sbbs/node4
rm -rf /sbbs/3rdp
rm -rf /sbbs/src
rm -rf /sbbs/repo