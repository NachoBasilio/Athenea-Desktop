// preload.js

// Este archivo corre en el contexto de preload de Electron.
// Podés usarlo para exponer APIs seguras a tu frontend.
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('myAPI', {
	ping: () => 'pong',
})
