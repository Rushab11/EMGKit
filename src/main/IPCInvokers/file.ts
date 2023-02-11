import { ipcRenderer } from 'electron';

const dialogHandler = {
  openFile() {
    return ipcRenderer.invoke("dialog:openFile") as Promise<any>;
  },
};

type DialogHandler = typeof dialogHandler;

export { dialogHandler, DialogHandler };
