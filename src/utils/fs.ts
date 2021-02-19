import fs from "fs";
const fsp = fs.promises;

const exists = (path: string) =>
  fsp
    .stat(path)
    .then(() => true)
    .catch(() => false);

module.exports = { fs, fsp: { ...fsp, exists } };
