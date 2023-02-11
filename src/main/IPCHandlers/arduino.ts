import { SerialPort } from 'serialport';

export async function arduinoStateCheck(): Promise<boolean> {
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
