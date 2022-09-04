#! /bin/bash

cd /tmp

ARCH=$(uname -m)
VERSION=$(curl --header "authorization: Bearer $GITHUB_TOKEN" -s https://api.github.com/repos/LukeChannings/deno-arm64/releases/latest | grep "tag_name" | cut -d : -f 2,3 | tr -d \" | cut -d "," -f 1 | sed 's/ *$//g' | sed 's/^ *//g')

echo ""
echo "Retrieving Deno: $VERSION $ARCH"

# linux/amd64 --- -Lsf
[ "$ARCH" == "x86_64" ] && curl -Lsf "https://github.com/denoland/deno/releases/download/$VERSION/deno-x86_64-unknown-linux-gnu.zip" -o deno.zip || true

# linux/arm64
[ "$ARCH" == "aarch64" ] && curl -Lsf "https://github.com/LukeChannings/deno-arm64/releases/download/$VERSION/deno-linux-arm64.zip" -o deno.zip || true

# extract deno.zip to /usr/local/bin/deno
[ -f "deno.zip" ] && unzip deno.zip && rm deno.zip && mv deno /usr/local/bin/deno
