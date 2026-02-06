import { createServer } from "vite";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function start() {
  const server = await createServer({
    server: {
      host: "127.0.0.1",
      port: 0,
    },
  });

  await server.listen();

  const url =
    server.resolvedUrls?.local?.[0] ||
    `http://localhost:${server.config.server.port || 5173}`;

  console.log(`[dev-electron] Vite dev server en ${url}`);

  const isWin = process.platform === "win32";
  const localElectronBin = path.resolve(
    __dirname,
    "..",
    "node_modules",
    ".bin",
    isWin ? "electron.cmd" : "electron",
  );

  const electronBin = fs.existsSync(localElectronBin)
    ? localElectronBin
    : "electron";

  const electronProcess = spawn(electronBin, [".", "--no-sandbox"], {
    stdio: "inherit",
    // En Windows, el binario local suele ser .cmd y requiere shell.
    shell: isWin,
    env: {
      ...process.env,
      DEV_SERVER_URL: url,
      NODE_OPTIONS: "--experimental-require-module --no-warnings",
      ELECTRON_DISABLE_SANDBOX: "1",
    },
    cwd: path.resolve(__dirname, ".."),
  });

  const clean = () => {
    electronProcess.kill();
    server.close();
  };

  electronProcess.on("close", (code) => {
    clean();
    process.exit(code ?? 0);
  });

  const handleSignal = () => {
    clean();
    process.exit(0);
  };

  process.on("SIGINT", handleSignal);
  process.on("SIGTERM", handleSignal);
}

start().catch((err) => {
  console.error("[dev-electron] Error:", err);
  process.exit(1);
});
