const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
	mainWindow = new BrowserWindow({
		height: 600,
		width: 800
	});

	mainWindow.maximize();

	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, './app/index.html'),
		protocol: 'file:',
		slashes: true
	}));

	// mainWindow.webContents.openDevTools();

	mainWindow.on('closed', function() {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

// Handle Cmd+Q on OS X
app.on('window-all-closed', function() {
	if (process.platform !== 'darwin') {
		app.quit()
	}
});

// Handle window recreation in OS X
app.on('activate', function() {
	if (mainWindow === null) {
		createWindow();
	}
});
