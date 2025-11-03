import { app, BrowserWindow } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Deshabilitar features que causan warnings innecesarios
app.commandLine.appendSwitch('disable-features', 'Autofill')

function createWindow() {
	const win = new BrowserWindow({
		width: 1000,
		height: 700,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			devTools: true,
		},
	})

	const isDev = !app.isPackaged

	if (isDev) {
		win.loadURL('http://localhost:5171')
		win.webContents.openDevTools()
	} else {
		win.loadFile(path.join(__dirname, 'dist/index.html'))
	}

	win.webContents.on('console-message', (event, level, message) => {
		if (message.includes('Autofill')) {
			event.preventDefault()
		}
	})
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		createWindow()
	}
})
