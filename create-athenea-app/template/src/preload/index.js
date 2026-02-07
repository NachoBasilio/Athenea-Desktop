import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  settings: {
    get: () => ipcRenderer.invoke("settings:get"),
    set: (data) => ipcRenderer.invoke("settings:set", data),
  },
  window: {
    openRoute: (options) => ipcRenderer.send("window:openRoute", options),
  },
});
