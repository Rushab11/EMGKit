import { ipcRenderer } from 'electron';

const arduinoHandler = {
  getStatus() {
    return ipcRenderer.invoke('arduino:stateRequest') as Promise<any>;
  },
};

type ArduinoHandler = typeof arduinoHandler;

export { arduinoHandler, ArduinoHandler };
