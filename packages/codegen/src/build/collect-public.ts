import _glob from "glob";
import { promisify } from "util";
const glob = promisify(_glob);
import fse from "fs-extra";
const { stat } = fse;

/**
 * @returns A string array of all the files in the public folder
 */
const collectPublicFiles = async () => {
  console.log("collecting public files");
  const publicFiles = (await glob("public/**/*")).map((path) => path.slice(6));
  // Association files live under .well-known/, which glob skips by default.
  for (const wellKnownFile of [
    "/.well-known/assetlinks.json",
    "/.well-known/apple-app-site-association",
  ]) {
    try {
      if ((await stat(`public${wellKnownFile}`)).isFile())
        publicFiles.push(wellKnownFile);
    } catch {
      /*empty*/
    }
  }
  try {
    if ((await stat("app/favicon.ico")).isFile())
      publicFiles.push("/favicon.ico");
  } catch {
    /*empty*/
  }
  //NextJS dynamic robots.txt
  try {
    if ((await stat("app/robots.ts")).isFile()) {
      publicFiles.push("/robots.txt");
    }
  } catch {
    /* empty */
  }

  return publicFiles;
};

export default collectPublicFiles;
