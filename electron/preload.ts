import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (message: string) => ipcRenderer.send('message', message),
  reportStatus: (status: 'show' | 'hide') => ipcRenderer.send('check-in-status', status),
});
