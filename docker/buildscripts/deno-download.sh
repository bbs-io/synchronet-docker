#! /bin/bash

cd /tmp

ARCH=$(uname -m)

if [ -z "$GH_TOKEN" ]
then
      VERSION=$(curl -s https://api.github.com/repos/LukeChannings/deno-arm64/releases/latest | jq -r '.tag_name')
else
      VERSION=$(curl --header "authorization: Bearer $GH_TOKEN" -s https://api.github.com/repos/LukeChannings/deno-arm64/releases/latest | jq -r '.tag_name')
fi

echo ""
echo "Retrieving Deno: $VERSION $ARCH"

# linux/amd64 --- -Lsf
[ "$ARCH" == "x86_64" ] && curl -Lsf "https://github.com/denoland/deno/releases/download/$VERSION/deno-x86_64-unknown-linux-gnu.zip" -o deno.zip || true

# linux/arm64
[ "$ARCH" == "aarch64" ] && curl -Lsf "https://github.com/LukeChannings/deno-arm64/releases/download/$VERSION/deno-linux-arm64.zip" -o deno.zip || true

# extract deno.zip to /usr/local/bin/deno
[ -f "deno.zip" ] && unzip deno.zip && rm deno.zip && mv deno /usr/local/bin/deno
