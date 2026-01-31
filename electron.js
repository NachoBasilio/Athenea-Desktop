import { app, BrowserWindow, ipcMain, dialog, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'
import keytar from 'keytar'
import pdfPrinter from 'pdf-to-printer'
import { spawn } from 'child_process'
import log from 'electron-log'

// Inicializar logger
log.initialize()
log.transports.file.level = 'info'
log.info('🚀 Iniciando aplicación...')

const { print: printPDF, getPrinters } = pdfPrinter

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Deshabilitar features que causan warnings innecesarios
app.commandLine.appendSwitch('disable-features', 'Autofill')

// En dev (o si viene seteado), deshabilitar sandbox para evitar issues de permisos en Linux
if (!app.isPackaged || process.env.ELECTRON_DISABLE_SANDBOX === '1') {
	app.commandLine.appendSwitch('no-sandbox')
}

// ------------------- BACKEND MANAGER -------------------

let backendProcess = null

/** Resuelve la ruta del binario de backend según entorno. */
function getBackendPath() {
	const isWin = process.platform === 'win32'
	const executableName = isWin ? 'api_billing_software.exe' : 'api_billing_software'

	if (app.isPackaged) {
		return path.join(process.resourcesPath, 'api_billing_software', executableName)
	}

	// En desarrollo, asumimos que el backend está en la carpeta dist del backend
	// Ajustar esta ruta según tu estructura local si es necesario
	return path.join(__dirname, '..', 'backend', 'dist', 'api_billing_software', executableName)
}

/** Inicia el backend local, loguea stdout/stderr y maneja errores. */
function startBackend() {
	const backendPath = getBackendPath()
	log.info('🚀 Intentando iniciar backend desde:', backendPath)

	if (!fs.existsSync(backendPath)) {
		log.error('⚠️ No se encontró el ejecutable del backend en:', backendPath)
		log.error('   Si estás en desarrollo, asegúrate de haber compilado el backend.')
		return
	}

	try {
		backendProcess = spawn(backendPath, [], {
			cwd: path.dirname(backendPath),
			stdio: 'pipe', // Para capturar logs
			windowsHide: true, // Ocultar ventana de consola en Windows
		})

		log.info(`[BACKEND] Proceso spawneado con PID: ${backendProcess.pid}`)

		backendProcess.stdout.on('data', (data) => {
			log.info(`[BACKEND STDOUT] ${data.toString().trim()}`)
		})

		backendProcess.stderr.on('data', (data) => {
			log.error(`[BACKEND STDERR] ${data.toString().trim()}`)
		})

		backendProcess.on('close', (code) => {
			log.info(`[BACKEND] Proceso terminado con código ${code}`)
			backendProcess = null
		})

		backendProcess.on('error', (err) => {
			log.error('[BACKEND] Error al iniciar el proceso:', err)
		})
	} catch (error) {
		log.error('[BACKEND] Excepción al intentar spawnear:', error)
	}
}

/** Detiene el backend si está corriendo. */
function stopBackend() {
	if (backendProcess) {
		log.info('🛑 Deteniendo backend...')
		backendProcess.kill()
		backendProcess = null
	}
}

// ------------------- VENTANA PRINCIPAL -------------------

/** @type {BrowserWindow | null} */
let mainWindow = null

// Mapa para NO duplicar ventanas por ruta
/** @type {Map<string, BrowserWindow>} */
const childWindowsByRoute = new Map()

// Ruta para guardar configuración simple en JSON
const settingsPath = path.join(app.getPath('userData'), 'settings.json')

/** Crea ventana principal, carga renderer y sincroniza eventos hijo/padre. */
function createWindow() {
	const isDev = !app.isPackaged
	const devServerUrl = process.env.DEV_SERVER_URL || 'http://localhost:5171'

	// Debug logs
	log.info('🔍 isDev:', isDev)
	log.info('🔍 __dirname:', __dirname)
	log.info('🔍 app.isPackaged:', app.isPackaged)

	// Obtener el tamaño de la pantalla
	const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize

	mainWindow = new BrowserWindow({
		width: screenWidth,
		height: screenHeight,
		title: 'Facturacion',
		webPreferences: {
			preload: path.join(__dirname, 'preload.cjs'),
			devTools: isDev,
			contextIsolation: true,
			nodeIntegration: false,
		},
	})

	mainWindow.setMenuBarVisibility(false)
	mainWindow.setAutoHideMenuBar(true)

	// Maximizar la ventana principal al iniciar
	mainWindow.maximize()

	if (isDev) {
		mainWindow.loadURL(devServerUrl)
		mainWindow.webContents.openDevTools()
	} else {
		const indexPath = path.join(__dirname, 'dist', 'index.html')
		log.info('🔍 Loading index from:', indexPath)
		log.info('🔍 File exists:', fs.existsSync(indexPath))

		mainWindow.loadFile(indexPath, {
			query: {
				route: '/',
			},
		})
	}

	// Ocultar warnings de Autofill
	mainWindow.webContents.on('console-message', (event) => {
		const message = event.message?.toString?.() ?? ''
		if (message.includes('Autofill')) {
			event.preventDefault()
		}
	})

	// Debug: detectar errores de carga
	mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
		log.error('❌ Main window failed to load:', errorCode, errorDescription)
	})

	mainWindow.webContents.on('did-finish-load', () => {
		log.info('✅ Main window loaded successfully')
	})

	// Notificar al renderer cuando la ventana se maximiza / restaura
	mainWindow.on('maximize', () => {
		mainWindow?.webContents.send('window:maximized')
	})

	mainWindow.on('unmaximize', () => {
		mainWindow?.webContents.send('window:unmaximized')
	})

	// 👉 Cuando se minimiza la principal, minimizamos las hijas
	mainWindow.on('minimize', () => {
		for (const [, child] of childWindowsByRoute) {
			if (!child.isDestroyed() && !child.isMinimized()) {
				child.minimize()
			}
		}
	})

	// 👉 Cuando se restaura la principal, restauramos las hijas
	mainWindow.on('restore', () => {
		for (const [, child] of childWindowsByRoute) {
			if (!child.isDestroyed()) {
				child.restore()
			}
		}
	})
}

app.whenReady().then(() => {
	startBackend()
	createWindow()
})

app.on('will-quit', () => {
	stopBackend()
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})

// ------------------- HELPERS SETTINGS -------------------

/** Lee settings JSON desde userData. */
function readSettings() {
	try {
		if (!fs.existsSync(settingsPath)) return {}
		const raw = fs.readFileSync(settingsPath, 'utf-8')
		return JSON.parse(raw)
	} catch (err) {
		log.error('Error leyendo settings:', err)
		return {}
	}
}

/** Persiste settings JSON en userData. */
function writeSettings(data) {
	try {
		fs.writeFileSync(settingsPath, JSON.stringify(data, null, 2), 'utf-8')
		return true
	} catch (err) {
		log.error('Error guardando settings:', err)
		return false
	}
}

// ------------------- IPC: APP / WINDOW -------------------

/** IPC de app: version/env/quit/relaunch. */
ipcMain.handle('app:getVersion', () => app.getVersion())
ipcMain.handle(
	'app:getEnv',
	() => process.env.NODE_ENV || (app.isPackaged ? 'production' : 'development')
)
ipcMain.on('app:quit', () => app.quit())
ipcMain.on('app:relaunch', () => {
	app.relaunch()
	app.exit(0)
})

/** IPC ventana: minimizar sincronizando hijas si aplica. */
ipcMain.on('window:minimize', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	if (!win) return

	win.minimize()

	if (win === mainWindow) {
		for (const [, child] of childWindowsByRoute) {
			if (!child.isDestroyed() && !child.isMinimized()) {
				child.minimize()
			}
		}
	}
})

/** Alterna maximizar/restaurar según estado actual. */
ipcMain.on('window:maximize', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	if (!win) return

	if (win.isMaximized()) {
		win.unmaximize()
	} else {
		win.maximize()
	}
})

ipcMain.on('window:unmaximize', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	if (!win) return
	if (win.isMaximized()) {
		win.unmaximize()
	}
})

ipcMain.on('window:close', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	win?.close()
})

ipcMain.handle('window:isMaximized', (event) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	return win?.isMaximized() ?? false
})

/** Ajusta tamaño de ventana desde renderer; usa sender para elegir la ventana. */
ipcMain.on('window:setSize', (event, payload = {}) => {
	const win = BrowserWindow.fromWebContents(event.sender)
	if (!win) return

	const { width, height, center } = payload ?? {}

	const requestedWidth = Number(width)
	const requestedHeight = Number(height)

	if (!Number.isFinite(requestedWidth) || !Number.isFinite(requestedHeight)) {
		console.warn('⚠️ window:setSize recibió valores inválidos:', { width, height })
		return
	}

	const finalWidth = Math.max(200, requestedWidth)
	const finalHeight = Math.max(150, requestedHeight)

	try {
		// Si está maximizada, el setSize no se nota (queda maximizada)
		if (win.isMaximized()) win.unmaximize()

		win.setSize(finalWidth, finalHeight)

		if (center) {
			const parent = win.getParentWindow?.()
			const referenceBounds = (parent ?? win).getBounds()
			const display = screen.getDisplayMatching(referenceBounds)
			const { x, y, width: dw, height: dh } = display.workArea

			const nextX = x + Math.round((dw - finalWidth) / 2)
			const nextY = y + Math.round((dh - finalHeight) / 2)
			win.setPosition(nextX, nextY)
		}
	} catch (error) {
		console.error('❌ Error en window:setSize:', error)
	}
})

// ------------------- IPC: DIALOGOS -------------------

/** IPC diálogos: abrir archivo. */
ipcMain.handle('dialog:openFile', async (_event, options) => {
	const result = await dialog.showOpenDialog(mainWindow ?? undefined, {
		properties: ['openFile'],
		...options,
	})
	return result
})

/** IPC diálogos: abrir carpeta. */
ipcMain.handle('dialog:openFolder', async (_event, options) => {
	const result = await dialog.showOpenDialog(mainWindow ?? undefined, {
		properties: ['openDirectory'],
		...options,
	})
	return result
})

/** IPC diálogos: guardar archivo. */
ipcMain.handle('dialog:saveFile', async (_event, options) => {
	const result = await dialog.showSaveDialog(mainWindow ?? undefined, {
		...options,
	})
	return result
})

// ------------------- IPC: SETTINGS -------------------

ipcMain.handle('settings:get', () => readSettings())

ipcMain.handle('settings:set', (_event, data) => {
	const current = readSettings()
	const merged = { ...current, ...data }
	writeSettings(merged)
	return merged
})

ipcMain.handle('settings:reset', () => {
	writeSettings({})
	return {}
})

// ------------------- IPC: SECURE STORE (KEYTAR) -------------------

const DEFAULT_SERVICE = 'athenea'

ipcMain.handle('secureStore:getToken', async (_event, service = DEFAULT_SERVICE) => {
	const account = os.userInfo().username
	const token = await keytar.getPassword(service, account)
	return token
})

ipcMain.handle('secureStore:setToken', async (_event, { service = DEFAULT_SERVICE, token }) => {
	const account = os.userInfo().username
	await keytar.setPassword(service, account, token)
	return true
})

ipcMain.handle('secureStore:deleteToken', async (_event, service = DEFAULT_SERVICE) => {
	const account = os.userInfo().username
	await keytar.deletePassword(service, account)
	return true
})

// ------------------- IPC: IMPRESIÓN -------------------

ipcMain.handle('printer:getPrinters', async () => {
	return await getPrinters()
})

ipcMain.handle('printer:printPDF', async (_event, { filePath, options }) => {
	try {
		await printPDF(filePath, options || {})
		return { ok: true }
	} catch (err) {
		log.error('Error imprimiendo PDF:', err)
		return { ok: false, error: err?.message || String(err) }
	}
})

// ------------------- IPC: LOG SENCILLO -------------------

ipcMain.on('log:info', (_event, msg) => {
	log.info('[INFO]', msg)
})

ipcMain.on('log:error', (_event, msg) => {
	log.error('[ERROR]', msg)
})

// ------------------- IPC: VENTANA NUEVA (SIN DUPLICADOS) -------------------

ipcMain.on('window:openRoute', (_event, options) => {
	const route = typeof options === 'string' ? options : options?.route
	const title = typeof options === 'object' ? options.title : null
	const requestedWidth =
		typeof options === 'object' && options.width ? Number(options.width) : undefined
	const requestedHeight =
		typeof options === 'object' && options.height ? Number(options.height) : undefined

	if (!route) {
		log.warn('⚠️ window:openRoute llamado sin route')
		return
	}

	console.log('🔍 IPC window:openRoute llamado con:', {
		route,
		title,
		requestedWidth,
		requestedHeight,
	})

	const routeKey = String(route)

	const existing = childWindowsByRoute.get(routeKey)
	if (existing && !existing.isDestroyed()) {
		log.info('🔁 Ventana ya existe para', routeKey, '→ focus')
		if (existing.isMinimized()) existing.restore()
		existing.focus()
		return
	} else if (existing) {
		childWindowsByRoute.delete(routeKey)
	}

	const isDev = !app.isPackaged

	const winWidth = requestedWidth || 1200
	const winHeight = requestedHeight || 700

	let x
	let y

	if (mainWindow) {
		const mainBounds = mainWindow.getBounds()
		const display = screen.getDisplayMatching(mainBounds)
		const { x: dx, y: dy, width: dw, height: dh } = display.workArea

		x = dx + Math.round((dw - winWidth) / 2)
		y = dy + Math.round((dh - winHeight) / 2)
	}

	const preloadPath = path.join(__dirname, 'preload.cjs')
	log.info('🔍 Preload path:', preloadPath)
	log.info('🔍 Preload exists:', fs.existsSync(preloadPath))

	const child = new BrowserWindow({
		width: winWidth,
		height: winHeight,
		x,
		y,
		title: title || 'Facturacion',
		resizable: true,
		minimizable: true,
		maximizable: true,
		modal: false,
		webPreferences: {
			preload: preloadPath,
			devTools: isDev,
			contextIsolation: true,
			nodeIntegration: false,
		},
	})

	child.setMenuBarVisibility(false)
	child.setAutoHideMenuBar(true)

	// Establecer relación padre-hijo para que siempre esté arriba de la madre
	if (mainWindow && !mainWindow.isDestroyed()) {
		child.setParentWindow(mainWindow)
	}

	child.on('maximize', () => {
		child.webContents.send('window:maximized')
	})

	child.on('unmaximize', () => {
		child.webContents.send('window:unmaximized')
	})

	childWindowsByRoute.set(routeKey, child)

	if (isDev) {
		const devUrl = `${devServerUrl}?route=${encodeURIComponent(route)}&child=1`
		log.info('🔍 Loading child window (dev):', devUrl)
		child.loadURL(devUrl)
		child.webContents.openDevTools()
	} else {
		const indexPath = path.join(__dirname, 'dist', 'index.html')
		log.info('🔍 Loading child window (prod):', indexPath)
		log.info('🔍 With route:', route)

		child.loadFile(indexPath, {
			query: {
				route: route,
				child: '1',
			},
		})
	}

	child.on('closed', () => {
		const current = childWindowsByRoute.get(routeKey)
		if (current === child) {
			log.info('🧹 Eliminando ventana del mapa para', routeKey)
			childWindowsByRoute.delete(routeKey)
		}
	})

	child.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
		log.error('❌ Child window failed to load:', errorCode, errorDescription)
		log.error('   Route was:', route)
	})

	child.webContents.on('did-finish-load', () => {
		log.info('✅ Child window loaded successfully for route:', route)
	})

	child.webContents.on('console-message', (event, level, message) => {
		log.info(`[Child Window Console] ${message}`)
	})
})
