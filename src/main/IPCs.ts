import { IpcMainInvokeEvent } from 'electron';

import { arduinoStateCheck } from './IPCHandlers/arduino';
import { handleFileOpen } from './IPCHandlers/file';

interface IPC {
  event: string;
  handler: (event: IpcMainInvokeEvent, ...args: any[]) => any;
}

const IPCs = {
  dialog: {
    open: {
      event: 'dialog:openFile',
      handler: handleFileOpen,
    },
  },
  arduino: {
    stateRequest: {
      event: 'arduino:stateRequest',
      handler: arduinoStateCheck,
    },
  },
};

let IPCEvents: Array<IPC> = [];
Object.values(IPCs).forEach((eventCategory) => {
  Object.values(eventCategory).forEach((event) => {
    IPCEvents.push(event);
  });
});

export { IPCEvents, IPCs };
