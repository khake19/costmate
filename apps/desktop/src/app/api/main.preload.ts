import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    platform: process.platform,
    windowMinimize: () => ipcRenderer.send('window-minimize'),
    windowMaximize: () => ipcRenderer.send('window-maximize'),
    windowClose: () => ipcRenderer.send('window-close'),
    validateLicense: (key: string) => ipcRenderer.invoke('validate-license', key),
    checkLicense: () => ipcRenderer.invoke('check-license'),
    getLicenseInfo: () => ipcRenderer.invoke('get-license-info'),
});
