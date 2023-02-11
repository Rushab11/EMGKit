import { DialogHandler, ArduinoHandler } from 'main/preload';

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    dialog: DialogHandler;
    arduino: ArduinoHandler;
  }
}

export {};
