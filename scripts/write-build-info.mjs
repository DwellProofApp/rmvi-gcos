import { execFileSync } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";

const root = new URL("..", import.meta.url);
const packageJson = JSON.parse(execFileSync("node", ["-e", "console.log(JSON.stringify(require('./package.json')))"], { cwd: root }).toString());

const info = {
  app: "rmvi-gcos",
  name: "Remedy Movement International GCOS",
  version: packageJson.version,
  generatedAt: new Date().toISOString(),
  gitCommit: readGit(["rev-parse", "--short", "HEAD"]),
  gitBranch: readGit(["rev-parse", "--abbrev-ref", "HEAD"]),
  deploymentTarget: process.env.GCOS_DEPLOYMENT_TARGET || "firebase",
  domain: process.env.GCOS_DOMAIN || "rmvi.org"
};

await writeFile(join(root.pathname, "public", "build-info.json"), `${JSON.stringify(info, null, 2)}\n`);
console.log(`Build info written: ${info.gitCommit} (${info.deploymentTarget})`);

function readGit(args) {
  try {
    return execFileSync("git", args, { cwd: root }).toString().trim();
  } catch {
    return "unknown";
  }
}
