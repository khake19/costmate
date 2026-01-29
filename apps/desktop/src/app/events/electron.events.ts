/**
 * This module is responsible on handling all the inter process communications 
 * between the frontend to the electron backend.
 */

import { app, ipcMain, BrowserWindow } from 'electron';
import { environment } from '../../environments/environment';

export default class ElectronEvents {
    static bootstrapElectronEvents(): Electron.IpcMain {
        return ipcMain;
    }
}

// Retrieve app version
ipcMain.handle('get-app-version', (event) => {
    console.log(`Fetching application version... [v${environment.version}]`);

    return environment.version;
});

// Handle App termination
ipcMain.on('quit', (event, code) => {
    app.exit(code);
});

// Window controls
ipcMain.on('window-minimize', () => {
    BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on('window-maximize', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win?.isMaximized()) {
        win.unmaximize();
    } else {
        win?.maximize();
    }
});

ipcMain.on('window-close', () => {
    BrowserWindow.getFocusedWindow()?.close();
});