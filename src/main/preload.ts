import { contextBridge } from 'electron';
import { arduinoHandler, ArduinoHandler } from './IPCInvokers/arduino';
import { dialogHandler, DialogHandler } from './IPCInvokers/file';

contextBridge.exposeInMainWorld('dialog', dialogHandler);
contextBridge.exposeInMainWorld('arduino', arduinoHandler);

export { DialogHandler, ArduinoHandler };
