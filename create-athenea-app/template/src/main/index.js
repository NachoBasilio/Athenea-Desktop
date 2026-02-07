import { app, BrowserWindow, ipcMain, screen } from "electron";
import path, { join } from "path";
import fs from "fs";

// ------------------- VENTANA PRINCIPAL -------------------

/** @type {BrowserWindow | null} */
let mainWindow = null;

/** @type {Map<string, BrowserWindow>} */
const childWindowsByRoute = new Map();

const settingsPath = path.join(app.getPath("userData"), "settings.json");

function createWindow() {
  const { width: screenWidth, height: screenHeight } =
    screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: screenWidth,
    height: screenHeight,
    title: __APP_TITLE_JSON__,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.setAutoHideMenuBar(true);
  mainWindow.maximize();

  // electron-vite: usa ELECTRON_RENDERER_URL en dev
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

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
}

app.whenReady().then(() => {
  createWindow();
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
    return JSON.parse(fs.readFileSync(settingsPath, "utf-8"));
  } catch {
    return {};
  }
}

function writeSettings(data) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch {
    return false;
  }
}

// ------------------- IPC -------------------

ipcMain.handle("settings:get", () => readSettings());

ipcMain.handle("settings:set", (_event, data) => {
  const current = readSettings();
  const merged = { ...current, ...data };
  writeSettings(merged);
  return merged;
});

ipcMain.on("window:openRoute", (_event, options) => {
  const route = typeof options === "string" ? options : options?.route;
  const title = typeof options === "object" ? options.title : null;
  if (!route) return;

  const routeKey = String(route);
  const existing = childWindowsByRoute.get(routeKey);
  if (existing && !existing.isDestroyed()) {
    if (existing.isMinimized()) existing.restore();
    existing.focus();
    return;
  }

  const child = new BrowserWindow({
    width: 1200,
    height: 700,
    title: title || __APP_TITLE_JSON__,
    webPreferences: {
      preload: join(__dirname, "../preload/index.mjs"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  child.setMenuBarVisibility(false);
  child.setAutoHideMenuBar(true);
  if (mainWindow && !mainWindow.isDestroyed()) {
    child.setParentWindow(mainWindow);
  }
  childWindowsByRoute.set(routeKey, child);

  if (process.env.ELECTRON_RENDERER_URL) {
    child.loadURL(
      `${process.env.ELECTRON_RENDERER_URL}?route=${encodeURIComponent(route)}&child=1`,
    );
    child.webContents.openDevTools();
  } else {
    child.loadFile(join(__dirname, "../renderer/index.html"), {
      query: { route, child: "1" },
    });
  }

  child.on("closed", () => {
    const current = childWindowsByRoute.get(routeKey);
    if (current === child) childWindowsByRoute.delete(routeKey);
  });
});
