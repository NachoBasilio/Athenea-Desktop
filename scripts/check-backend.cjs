"use strict";

const fs = require("fs");
const path = require("path");

/** Backend binary name, overridable via env var for forks/rebrands. */
const BACKEND_BINARY_NAME =
  process.env.ATHENEA_BACKEND_BINARY || "athenea-backend";

/**
 * electron-builder `beforePack` hook.
 *
 * electron-builder only warns (`file source doesn't exist`) and exits with a
 * success code when an `extraResources` entry is missing, which would ship an
 * installer without a working backend. This hook fails packaging fast with a
 * clear error instead, before electron-builder starts copying resources.
 *
 * Only runs during electron-builder packaging (`pack`/`dist*` scripts); plain
 * `npm run build` (electron-vite only) never invokes this hook.
 */
module.exports = async function checkBackend(context) {
  const isWin = context.electronPlatformName === "win32";
  const executableName = isWin
    ? `${BACKEND_BINARY_NAME}.exe`
    : BACKEND_BINARY_NAME;

  const appDir = context.packager.info.appDir;
  const backendSourceDir = path.resolve(
    appDir,
    "..",
    "backend",
    "dist",
    BACKEND_BINARY_NAME,
  );
  const backendBinaryPath = path.join(backendSourceDir, executableName);

  if (!fs.existsSync(backendBinaryPath)) {
    throw new Error(
      `[check-backend] Backend binary not found at: ${backendBinaryPath}\n` +
        "Build the backend before packaging. Expected output layout: " +
        "../backend/dist/athenea-backend/<binary-name>[.exe].",
    );
  }
};
