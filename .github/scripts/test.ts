#!/usr/bin/env -S deno -q run --unstable --allow-run --allow-read --allow-write --allow-net --allow-env

import { baseDir } from "./deps.ts";
console.log({ baseDir });
