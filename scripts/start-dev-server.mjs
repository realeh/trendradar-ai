import { spawn } from "node:child_process";
import { openSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = openSync(resolve(root, "trendradar-dev.log"), "a");
const err = openSync(resolve(root, "trendradar-dev.err.log"), "a");

const env = {};
for (const [key, value] of Object.entries(process.env)) {
  if (typeof value !== "string") continue;
  if (key.toLowerCase() === "path") {
    env.Path = value;
  } else {
    env[key] = value;
  }
}

const child = spawn(process.execPath, [resolve(root, "node_modules/next/dist/bin/next"), "dev", "-p", "3000"], {
  cwd: root,
  detached: true,
  stdio: ["ignore", out, err],
  env
});

child.unref();
console.log(`Started TrendRadar AI dev server with pid ${child.pid}`);
