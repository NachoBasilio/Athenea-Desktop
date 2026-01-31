const { contextBridge, ipcRenderer } = require('electron')

console.log('>>> PRELOAD CARGADO (CJS)')

/** Bridge seguro expuesto en window.electronAPI. */
const api = {
	// ---- APP ----
	getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
	getEnv: () => ipcRenderer.invoke('app:getEnv'),
	quit: () => ipcRenderer.send('app:quit'),
	relaunch: () => ipcRenderer.send('app:relaunch'),

	// ---- VENTANA ----
	// API de ventana (misma ventana según sender)
	window: {
		minimize: () => ipcRenderer.send('window:minimize'),
		maximize: () => ipcRenderer.send('window:maximize'),
		unmaximize: () => ipcRenderer.send('window:unmaximize'),
		close: () => ipcRenderer.send('window:close'),
		isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

		// abrir nueva ventana con una ruta
		openRoute: (routeOrOptions) => ipcRenderer.send('window:openRoute', routeOrOptions),

		// cambiar tamaño de la ventana actual
		setSize: (width, height, options = {}) =>
			ipcRenderer.send('window:setSize', { width, height, ...options }),

		onMaximize: (cb) => {
			const listener = () => cb()
			ipcRenderer.on('window:maximized', listener)
			return () => ipcRenderer.removeListener('window:maximized', listener)
		},
		onUnmaximize: (cb) => {
			const listener = () => cb()
			ipcRenderer.on('window:unmaximized', listener)
			return () => ipcRenderer.removeListener('window:unmaximized', listener)
		},
	},

	// ---- DIALOGOS ----
	dialogs: {
		openFile: (options) => ipcRenderer.invoke('dialog:openFile', options),
		openFolder: (options) => ipcRenderer.invoke('dialog:openFolder', options),
		saveFile: (options) => ipcRenderer.invoke('dialog:saveFile', options),
	},

	// ---- SETTINGS ----
	settings: {
		get: () => ipcRenderer.invoke('settings:get'),
		set: (data) => ipcRenderer.invoke('settings:set', data),
		reset: () => ipcRenderer.invoke('settings:reset'),
	},

	// ---- SECURE STORE / KEYTAR ----
	secureStore: {
		getToken: (service) => ipcRenderer.invoke('secureStore:getToken', service),
		setToken: (service, token) => ipcRenderer.invoke('secureStore:setToken', { service, token }),
		deleteToken: (service) => ipcRenderer.invoke('secureStore:deleteToken', service),
	},

	// ---- IMPRESIÓN ----
	printer: {
		getPrinters: () => ipcRenderer.invoke('printer:getPrinters'),
		printPDF: (filePath, options) => ipcRenderer.invoke('printer:printPDF', { filePath, options }),
	},

	// ---- LOG ----
	log: {
		info: (msg) => ipcRenderer.send('log:info', msg),
		error: (msg) => ipcRenderer.send('log:error', msg),
	},

	// ---- IPC CONTROLADO ----
	ipc: {
		invoke: (channel, data) => {
			const allowed = new Set([
				'app:getVersion',
				'app:getEnv',
				'window:isMaximized',
				'dialog:openFile',
				'dialog:openFolder',
				'dialog:saveFile',
				'settings:get',
				'settings:set',
				'settings:reset',
				'secureStore:getToken',
				'secureStore:setToken',
				'secureStore:deleteToken',
				'printer:getPrinters',
				'printer:printPDF',
			])
			if (!allowed.has(channel)) throw new Error(`IPC invoke no permitido: ${channel}`)
			return ipcRenderer.invoke(channel, data)
		},
		send: (channel, data) => {
			const allowed = new Set([
				'app:quit',
				'app:relaunch',
				'window:minimize',
				'window:maximize',
				'window:unmaximize',
				'window:close',
				'window:openRoute',
				'window:setSize',
				'log:info',
				'log:error',
			])
			if (!allowed.has(channel)) throw new Error(`IPC send no permitido: ${channel}`)
			return ipcRenderer.send(channel, data)
		},
		on: (channel, cb) => {
			const allowed = new Set(['window:maximized', 'window:unmaximized'])
			if (!allowed.has(channel)) throw new Error(`IPC on no permitido: ${channel}`)
			const listener = (_event, ...args) => cb(...args)
			ipcRenderer.on(channel, listener)
			return () => ipcRenderer.removeListener(channel, listener)
		},
		once: (channel, cb) => {
			const allowed = new Set(['window:maximized', 'window:unmaximized'])
			if (!allowed.has(channel)) throw new Error(`IPC once no permitido: ${channel}`)
			const listener = (_event, ...args) => cb(...args)
			ipcRenderer.once(channel, listener)
		},
	},
}

contextBridge.exposeInMainWorld('electronAPI', api)
