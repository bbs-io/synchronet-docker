import path from "path";
import os from "os";

export default process.env.SBBSDIR || path.normalize(`${os.homedir()}/sbbs`);
