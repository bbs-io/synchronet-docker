const fs = require("fs");
const pkg = require("../package.json");

pkg.devDependencies = undefined;
pkg.scripts = undefined;
pkg.bin.synchronet = "cli.js";
pkg.main = "main.js";

fs.writeFileSync(
  `${__dirname}/../dist/package.json`,
  JSON.stringify(pkg, null, 2),
  "utf8"
);
