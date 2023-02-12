import { ipcRenderer } from 'electron';

const dialogHandler = {
  openFile() {
    return ipcRenderer.invoke('dialog:openFile') as Promise<any>;
  },

  saveFile(data: unknown) {
    return ipcRenderer.invoke('dialog:saveFile', data) as Promise<any>;
  },
};

type DialogHandler = typeof dialogHandler;

export { dialogHandler, DialogHandler };
