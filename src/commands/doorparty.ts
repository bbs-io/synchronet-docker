import c from "colorette";
import fs from "fs";
import readline from "readline";
import run from "./run";
import init from "./init";
import sbbsdir from "../utils/sbbsdir";

export default async () => {
  if (fs.existsSync(`${sbbsdir}/ctrl/doorparty.ref`)) {
    console.log(
      c.bgBlack(c.gray(`${c.red("Doorparty is already marked as installed.")}`))
    );
  }

  const e = "\u001b";
  process.stdout.write(`${e}[2J${e}[0;0H`);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt): Promise<string> =>
    new Promise((resolve) => {
      rl.question(prompt, resolve);
    });

  let SYSTEM_TAG;
  let SSH_USERNAME;
  let SSH_PASSWORD;

  try {
    const p = c.whiteBright("\n: ");
    console.log(c.white(`Press ${c.yellowBright("CTRL+C")} to cancel.`));

    while (!SSH_USERNAME) {
      SSH_USERNAME = await question(
        c.white(c.blueBright(`\nDoorparty SSH Username?${p}`))
      );
    }

    while (!SSH_PASSWORD) {
      SSH_PASSWORD = await question(
        c.white(c.blueBright(`\nDoorparty SSH Password?${p}`))
      );
    }

    while (!SYSTEM_TAG) {
      const answer = await question(
        c.white(c.blueBright(`\nDoorparty TAG? ${c.gray("[FOO]")}${p}`))
      );
      if (!/^\[[A-Za-z]{2,4}\]$/.test(answer)) {
        console.log(c.redBright(`Invalid TAG.`));
        continue;
      }
      SYSTEM_TAG = answer.toUpperCase();
    }
  } finally {
    rl.close();
  }

  console.log("This is an incomplete method.");
};
