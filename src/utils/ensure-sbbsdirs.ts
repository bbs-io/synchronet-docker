import mkdirp from "mkdirp";
import sbbsdir from "./sbbsdir";

export default async () => {
  await mkdirp(`${sbbsdir}/backup`);
  await mkdirp(`${sbbsdir}/ctrl`);
  await mkdirp(`${sbbsdir}/data`);
  await mkdirp(`${sbbsdir}/nodes`);
  await mkdirp(`${sbbsdir}/text`);
  await mkdirp(`${sbbsdir}/xtrn`);
  await mkdirp(`${sbbsdir}/web`);
  await mkdirp(`${sbbsdir}/fido`);
  await mkdirp(`${sbbsdir}/mods`);
};
