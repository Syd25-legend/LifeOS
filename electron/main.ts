import { app, BrowserWindow, ipcMain, Tray, Menu, screen } from 'electron';
import path from 'path';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const createTray = () => {
    try {
        const iconPath = path.join(__dirname, '../../assets/logo.png'); // Adjust path as needed based on build structure
        tray = new Tray(iconPath);
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Show App', click: () => mainWindow?.show() },
            { label: 'Quit', click: () => app.quit() },
        ]);
        tray.setToolTip('Life OS');
        tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            mainWindow?.show();
        });
    } catch (error) {
        console.error("Tray creation failed (likely missing icon):", error);
    }
}

const createWindow = () => {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false, // Don't show until ready
    frame: true, // User requested standard window initially, but glass UI might look better frameless. Sticking to standard for now unless requested.
    backgroundColor: '#000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the index.html of the app.
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
  });

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// IPC listeners
ipcMain.on('check-in-status', (event, status) => {
  if (status === 'show') {
    mainWindow?.show();
    mainWindow?.focus();
    // Play sound logic here if needed, or trigger via renderer
  } else {
    // If not showing, maybe flash tray or just stay hidden/quit?
    // User said: "opens silently to the tray (or closes)"
    console.log("User already logged. Staying background/tray.");
    // If you want to strictly close if not needed:
    // app.quit(); 
    // But typically 'tray' means keep running.
  }
});

app.on('ready', () => {
    createWindow();
    createTray();
    
    // Safety timeout: Show window if no response after 10s (e.g. offline/error)
    setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible() && !mainWindow.isDestroyed()) {
        console.log("Timeout waiting for status. showing window.");
        // mainWindow.show(); // Optional: decide if fallback is show or stay hidden.
    }
    }, 10000);
});

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
