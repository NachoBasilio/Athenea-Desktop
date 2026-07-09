import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  screen,
  safeStorage,
} from "electron";
import path, { join } from "path";
import fs from "fs";
import os from "os";
import pdfPrinter from "pdf-to-printer";
import { spawn } from "child_process";
import log from "electron-log";

// Inicializar logger
log.initialize();
log.transports.file.level = "info";
log.info("🚀 Iniciando aplicación...");

const { print: printPDF, getPrinters } = pdfPrinter;

// Deshabilitar features que causan warnings innecesarios
app.commandLine.appendSwitch("disable-features", "Autofill");

// En dev en Linux, deshabilitar sandbox para evitar issues de permisos
// (el binario setuid del sandbox suele faltar en entornos de desarrollo Linux).
// Nunca se aplica en builds empaquetados: el sandbox de producción no debe
// poder desactivarse mediante variables de entorno.
if (!app.isPackaged && process.platform === "linux") {
  app.commandLine.appendSwitch("no-sandbox");
}

// ------------------- BACKEND MANAGER -------------------

let backendProcess = null;

/** Nombre del binario de backend, sobreescribible vía env var para forks/rebrandeos. */
const BACKEND_BINARY_NAME =
  process.env.ATHENEA_BACKEND_BINARY || "athenea-backend";

/** Resuelve la ruta del binario de backend según entorno. */
function getBackendPath() {
  const isWin = process.platform === "win32";
  const executableName = isWin
    ? `${BACKEND_BINARY_NAME}.exe`
    : BACKEND_BINARY_NAME;

  if (app.isPackaged) {
    return path.join(
      process.resourcesPath,
      BACKEND_BINARY_NAME,
      executableName,
    );
  }

  // En desarrollo, asumimos que el backend está en la carpeta dist del backend
  return path.join(
    __dirname,
    "..",
    "..",
    "..",
    "backend",
    "dist",
    BACKEND_BINARY_NAME,
    executableName,
  );
}

/** Inicia el backend local, loguea stdout/stderr y maneja errores. */
function startBackend() {
  const backendPath = getBackendPath();
  log.info("🚀 Intentando iniciar backend desde:", backendPath);

  if (!fs.existsSync(backendPath)) {
    log.error("⚠️ No se encontró el ejecutable del backend en:", backendPath);
    log.error(
      "   Si estás en desarrollo, asegúrate de haber compilado el backend.",
    );
    if (app.isPackaged) {
      dialog.showErrorBox(
        "Backend not found",
        `The backend executable could not be found at:\n${backendPath}\n\nThe application will continue to run, but backend-dependent features will not work.`,
      );
    }
    return;
  }

  try {
    backendProcess = spawn(backendPath, [], {
      cwd: path.dirname(backendPath),
      stdio: "pipe",
      windowsHide: true,
    });

    log.info(`[BACKEND] Proceso spawneado con PID: ${backendProcess.pid}`);

    backendProcess.stdout.on("data", (data) => {
      log.info(`[BACKEND STDOUT] ${data.toString().trim()}`);
    });

    backendProcess.stderr.on("data", (data) => {
      log.error(`[BACKEND STDERR] ${data.toString().trim()}`);
    });

    backendProcess.on("close", (code) => {
      log.info(`[BACKEND] Proceso terminado con código ${code}`);
      backendProcess = null;
    });

    backendProcess.on("error", (err) => {
      log.error("[BACKEND] Error al iniciar el proceso:", err);
      if (app.isPackaged) {
        dialog.showErrorBox(
          "Backend failed to start",
          `The backend process could not be started:\n${err?.message || String(err)}\n\nThe application will continue to run, but backend-dependent features will not work.`,
        );
      }
    });
  } catch (error) {
    log.error("[BACKEND] Excepción al intentar spawnear:", error);
    if (app.isPackaged) {
      dialog.showErrorBox(
        "Backend failed to start",
        `The backend process could not be started:\n${error?.message || String(error)}\n\nThe application will continue to run, but backend-dependent features will not work.`,
      );
    }
  }
}

/** Detiene el backend si está corriendo. */
function stopBackend() {
  if (backendProcess) {
    log.info("🛑 Deteniendo backend...");
    backendProcess.kill();
    backendProcess = null;
  }
}

// ------------------- VENTANA PRINCIPAL -------------------

/** @type {BrowserWindow | null} */
let mainWindow = null;

/** @type {Map<string, BrowserWindow>} */
const childWindowsByRoute = new Map();

const settingsPath = path.join(app.getPath("userData"), "settings.json");

/** Origen permitido para navegación (dev server o file:// en producción). */
function isNavigationAllowed(targetUrl) {
  try {
    const target = new URL(targetUrl);
    if (process.env.ELECTRON_RENDERER_URL) {
      const devOrigin = new URL(process.env.ELECTRON_RENDERER_URL).origin;
      return target.origin === devOrigin;
    }
    return target.protocol === "file:";
  } catch {
    return false;
  }
}

/** Bloquea apertura de ventanas nuevas y navegación fuera del origen propio. */
function hardenWebContents(webContents) {
  webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  webContents.on("will-navigate", (event, targetUrl) => {
    if (!isNavigationAllowed(targetUrl)) {
      log.warn("🚫 Navegación bloqueada hacia:", targetUrl);
      event.preventDefault();
    }
  });
}

/** Crea ventana principal, carga renderer y sincroniza eventos hijo/padre. */
function createWindow() {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    title: "App",
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.maximize();

  hardenWebContents(mainWindow.webContents);

  // electron-vite: usa ELECTRON_RENDERER_URL en dev
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"), {
      query: { route: "/" },
    });
  }

  // Ocultar warnings de Autofill
  mainWindow.webContents.on("console-message", (event) => {
    const message = event.message?.toString?.() ?? "";
    if (message.includes("Autofill")) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      log.error("❌ Main window failed to load:", errorCode, errorDescription);
    },
  );

  mainWindow.webContents.on("did-finish-load", () => {
    log.info("✅ Main window loaded successfully");
  });

  mainWindow.on("maximize", () => {
    mainWindow?.webContents.send("window:maximized");
  });

  mainWindow.on("unmaximize", () => {
    mainWindow?.webContents.send("window:unmaximized");
  });

  mainWindow.on("minimize", () => {
    for (const [, child] of childWindowsByRoute) {
      if (!child.isDestroyed() && !child.isMinimized()) {
        child.minimize();
      }
    }
  });

  mainWindow.on("restore", () => {
    for (const [, child] of childWindowsByRoute) {
      if (!child.isDestroyed()) {
        child.restore();
      }
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on("will-quit", () => {
  stopBackend();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// ------------------- HELPERS SETTINGS -------------------

function readSettings() {
  try {
    if (!fs.existsSync(settingsPath)) return {};
    const raw = fs.readFileSync(settingsPath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    log.error("Error leyendo settings:", err);
    return {};
  }
}

function writeSettings(data) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    log.error("Error guardando settings:", err);
    return false;
  }
}

// ------------------- IPC: APP / WINDOW -------------------

ipcMain.handle("app:getVersion", () => app.getVersion());
ipcMain.handle(
  "app:getEnv",
  () => process.env.NODE_ENV || (app.isPackaged ? "production" : "development"),
);
ipcMain.on("app:quit", () => app.quit());
ipcMain.on("app:relaunch", () => {
  app.relaunch();
  app.exit(0);
});

ipcMain.on("window:minimize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  win.minimize();

  if (win === mainWindow) {
    for (const [, child] of childWindowsByRoute) {
      if (!child.isDestroyed() && !child.isMinimized()) {
        child.minimize();
      }
    }
  }
});

ipcMain.on("window:maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on("window:unmaximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (win.isMaximized()) {
    win.unmaximize();
  }
});

ipcMain.on("window:close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  win?.close();
});

ipcMain.handle("window:isMaximized", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  return win?.isMaximized() ?? false;
});

ipcMain.on("window:setSize", (event, payload = {}) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;

  const { width, height, center } = payload ?? {};

  const requestedWidth = Number(width);
  const requestedHeight = Number(height);

  if (!Number.isFinite(requestedWidth) || !Number.isFinite(requestedHeight)) {
    console.warn("⚠️ window:setSize recibió valores inválidos:", {
      width,
      height,
    });
    return;
  }

  const finalWidth = Math.max(200, requestedWidth);
  const finalHeight = Math.max(150, requestedHeight);

  try {
    if (win.isMaximized()) win.unmaximize();

    win.setSize(finalWidth, finalHeight);

    if (center) {
      const parent = win.getParentWindow?.();
      const referenceBounds = (parent ?? win).getBounds();
      const display = screen.getDisplayMatching(referenceBounds);
      const { x, y, width: dw, height: dh } = display.workArea;

      const nextX = x + Math.round((dw - finalWidth) / 2);
      const nextY = y + Math.round((dh - finalHeight) / 2);
      win.setPosition(nextX, nextY);
    }
  } catch (error) {
    console.error("❌ Error en window:setSize:", error);
  }
});

// ------------------- IPC: DIALOGOS -------------------

ipcMain.handle("dialog:openFile", async (event, options) => {
  const parent =
    BrowserWindow.fromWebContents(event.sender) ?? mainWindow ?? undefined;
  const result = await dialog.showOpenDialog(parent, {
    properties: ["openFile"],
    ...options,
  });
  return result;
});

ipcMain.handle("dialog:openFolder", async (event, options) => {
  const parent =
    BrowserWindow.fromWebContents(event.sender) ?? mainWindow ?? undefined;
  const result = await dialog.showOpenDialog(parent, {
    properties: ["openDirectory"],
    ...options,
  });
  return result;
});

ipcMain.handle("dialog:saveFile", async (event, options) => {
  const parent =
    BrowserWindow.fromWebContents(event.sender) ?? mainWindow ?? undefined;
  const result = await dialog.showSaveDialog(parent, {
    ...options,
  });
  return result;
});

// ------------------- IPC: SETTINGS -------------------

ipcMain.handle("settings:get", () => readSettings());

ipcMain.handle("settings:set", (_event, data) => {
  const current = readSettings();
  const merged = { ...current, ...data };
  writeSettings(merged);
  return merged;
});

ipcMain.handle("settings:reset", () => {
  writeSettings({});
  return {};
});

// ------------------- IPC: SECURE STORE (safeStorage) -------------------

const DEFAULT_SERVICE = "athenea";

const secureStorePath = path.join(app.getPath("userData"), "secure-store.json");

function secureStoreKey(service, account) {
  return `${service}:${account}`;
}

function readSecureStore() {
  try {
    if (!fs.existsSync(secureStorePath)) return {};
    const raw = fs.readFileSync(secureStorePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    log.error("Error leyendo secure store:", err);
    return {};
  }
}

function writeSecureStore(data) {
  try {
    fs.writeFileSync(secureStorePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    log.error("Error guardando secure store:", err);
    return false;
  }
}

ipcMain.handle(
  "secureStore:getToken",
  async (_event, service = DEFAULT_SERVICE) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        log.error("secureStore:getToken - encryption no disponible");
        return null;
      }
      const account = os.userInfo().username;
      const store = readSecureStore();
      const encoded = store[secureStoreKey(service, account)];
      if (!encoded) return null;
      return safeStorage.decryptString(Buffer.from(encoded, "base64"));
    } catch (err) {
      log.error("Error en secureStore:getToken:", err);
      return null;
    }
  },
);

ipcMain.handle(
  "secureStore:setToken",
  async (_event, { service = DEFAULT_SERVICE, token }) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        log.error("secureStore:setToken - encryption no disponible");
        return false;
      }
      const account = os.userInfo().username;
      const store = readSecureStore();
      const encrypted = safeStorage.encryptString(token);
      store[secureStoreKey(service, account)] = encrypted.toString("base64");
      return writeSecureStore(store);
    } catch (err) {
      log.error("Error en secureStore:setToken:", err);
      return false;
    }
  },
);

ipcMain.handle(
  "secureStore:deleteToken",
  async (_event, service = DEFAULT_SERVICE) => {
    try {
      const account = os.userInfo().username;
      const store = readSecureStore();
      delete store[secureStoreKey(service, account)];
      return writeSecureStore(store);
    } catch (err) {
      log.error("Error en secureStore:deleteToken:", err);
      return false;
    }
  },
);

// ------------------- IPC: IMPRESIÓN -------------------
// pdf-to-printer only supports Windows; on other platforms we return a
// consistent "not supported" shape instead of letting it throw.

const isPrintingSupported = process.platform === "win32";

ipcMain.handle("printer:getPrinters", async () => {
  if (!isPrintingSupported) {
    log.warn("printer:getPrinters - Printing is only supported on Windows");
    return [];
  }

  try {
    return await getPrinters();
  } catch (err) {
    log.error("Error listando impresoras:", err);
    return [];
  }
});

ipcMain.handle("printer:printPDF", async (_event, { filePath, options }) => {
  if (!isPrintingSupported) {
    return { ok: false, error: "Printing is only supported on Windows" };
  }

  try {
    await printPDF(filePath, options || {});
    return { ok: true };
  } catch (err) {
    log.error("Error imprimiendo PDF:", err);
    return { ok: false, error: err?.message || String(err) };
  }
});

// ------------------- IPC: LOG SENCILLO -------------------

ipcMain.on("log:info", (_event, msg) => {
  log.info("[INFO]", msg);
});

ipcMain.on("log:error", (_event, msg) => {
  log.error("[ERROR]", msg);
});

// ------------------- IPC: VENTANA NUEVA (SIN DUPLICADOS) -------------------

ipcMain.on("window:openRoute", (_event, options) => {
  const route = typeof options === "string" ? options : options?.route;
  const title = typeof options === "object" ? options.title : null;
  const requestedWidth =
    typeof options === "object" && options.width
      ? Number(options.width)
      : undefined;
  const requestedHeight =
    typeof options === "object" && options.height
      ? Number(options.height)
      : undefined;

  if (!route) {
    log.warn("⚠️ window:openRoute llamado sin route");
    return;
  }

  const routeKey = String(route);

  const existing = childWindowsByRoute.get(routeKey);
  if (existing && !existing.isDestroyed()) {
    log.info("🔁 Ventana ya existe para", routeKey, "→ focus");
    if (existing.isMinimized()) existing.restore();
    existing.focus();
    return;
  } else if (existing) {
    childWindowsByRoute.delete(routeKey);
  }

  const winWidth = requestedWidth || 1200;
  const winHeight = requestedHeight || 700;

  let x;
  let y;

  if (mainWindow) {
    const mainBounds = mainWindow.getBounds();
    const display = screen.getDisplayMatching(mainBounds);
    const { x: dx, y: dy, width: dw, height: dh } = display.workArea;

    x = dx + Math.round((dw - winWidth) / 2);
    y = dy + Math.round((dh - winHeight) / 2);
  }

  const child = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x,
    y,
    title: title || "App",
    resizable: true,
    minimizable: true,
    maximizable: true,
    modal: false,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  child.setMenuBarVisibility(false);
  child.setAutoHideMenuBar(true);

  hardenWebContents(child.webContents);

  if (mainWindow && !mainWindow.isDestroyed()) {
    child.setParentWindow(mainWindow);
  }

  child.on("maximize", () => {
    child.webContents.send("window:maximized");
  });

  child.on("unmaximize", () => {
    child.webContents.send("window:unmaximized");
  });

  childWindowsByRoute.set(routeKey, child);

  if (process.env.ELECTRON_RENDERER_URL) {
    const devUrl = `${process.env.ELECTRON_RENDERER_URL}?route=${encodeURIComponent(route)}&child=1`;
    log.info("🔍 Loading child window (dev):", devUrl);
    child.loadURL(devUrl);
    child.webContents.openDevTools();
  } else {
    child.loadFile(join(__dirname, "../renderer/index.html"), {
      query: { route, child: "1" },
    });
  }

  child.on("closed", () => {
    const current = childWindowsByRoute.get(routeKey);
    if (current === child) {
      log.info("🧹 Eliminando ventana del mapa para", routeKey);
      childWindowsByRoute.delete(routeKey);
    }
  });

  child.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      log.error("❌ Child window failed to load:", errorCode, errorDescription);
    },
  );

  child.webContents.on("did-finish-load", () => {
    log.info("✅ Child window loaded successfully for route:", route);
  });
});
