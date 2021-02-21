const fs = require("fs");
const shell = require("shelljs");
const pkg = require("../package.json");

const src = `${__dirname}/../src`;
const dist = `${__dirname}/../dist`;

pkg.devDependencies = undefined;
pkg.scripts = undefined;
pkg.bin.synchronet = "cli.js";
pkg.main = "main.js";

fs.writeFileSync(`${dist}/package.json`, JSON.stringify(pkg, null, 2), "utf8");

// resources in dist/_res
shell.rm("-rf", `${dist}/_res/*`);
shell.mkdir("-p", `${dist}/_res/`);
shell.cp("-R", `${src}/_res/*`, `${dist}/_res/`);
