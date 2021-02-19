#!/usr/bin/env node
const { default: main } = require("./main");

main().catch((error: Error) => {
  console.error(error);
  process.exit(1);
});
