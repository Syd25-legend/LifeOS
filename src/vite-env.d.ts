/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    sendMessage: (message: string) => void;
    reportStatus: (status: 'show' | 'hide') => void;
  }
}
