import { PortInfo } from '@serialport/bindings-cpp';
import { SerialPort, SerialPortOpenOptions } from 'serialport';

class Arduino {
  portInfo: PortInfo | null = null;

  connection: SerialPort | null = null;

  messageBuffer: Array<string> = [];

  constructor() {}

  discoverArduinoSync() {
    return Promise.resolve(this.discoverArduino());
  }

  async discoverArduino(): Promise<void> {
    let ports = await SerialPort.list();

    let arduino = ports.find(
      (port) => port.vendorId === '2341' && port.productId === '0001'
    );

    if (arduino) {
      this.portInfo = arduino;
    }
  }

  makeConnectionSync() {
    return Promise.resolve(this.makeConnection());
  }

  async makeConnection(): Promise<void> {
    if (!this.portInfo) {
      await this.discoverArduino();
    }

    this.connection = new SerialPort({
      path: this.portInfo?.path!,
      baudRate: 115200,
    });

    this.connection.on('data', this.onMessage);
  }

  async onMessage(data: string): Promise<void> {
    console.log(`${data}`);
    // FIXME: Incomplete
    let buffer_size = this.messageBuffer.length;

    if (buffer_size === 0) {
      this.messageBuffer.push(data);
    }

    let last_item = this.messageBuffer.at(-1);

    if (data.endsWith('XXX')) {
      console.log(`${data}`);
    }

    if (!last_item?.endsWith('XXX')) {
      this.messageBuffer[buffer_size - 1] += data;
      console.log(`${this.messageBuffer[buffer_size - 1]}`);
    } else {
      this.messageBuffer.push(data);
    }
  }

  async arduinoStateCheck(): Promise<boolean> {
    let ports = await SerialPort.list();

    let arduino = ports.find(
      (port) => port.vendorId === '2341' && port.productId === '0001'
    );

    if (arduino) {
      return true;
    } else {
      return false;
    }
  }
}

let arduinoInstance = new Arduino();
arduinoInstance.makeConnectionSync();

async function arduinoStateCheck(): Promise<boolean> {
  return arduinoInstance.arduinoStateCheck();
}

export { arduinoStateCheck };

// export async function arduinoStateCheck(): Promise<boolean> {
//   let ports = await SerialPort.list();
//
//   let arduino = ports.find(
//     (port) => port.vendorId === '2341' && port.productId === '0001'
//   );
//
//   if (arduino) {
//     return true;
//   } else {
//     return false;
//   }
// }
