/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  IpcRendererEvent,
  IpcMainEvent,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import fs, { PathLike } from 'fs';
import { parse } from 'csv-parse';
import { Path } from 'react-router-dom';
import { EMGFilter } from '../../utils/EMGFilter/EMGFilters';
import {
  SAMPLE_FREQUENCY,
  NOTCH_FREQUENCY,
} from '../../utils/EMGFilter/constants';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer');
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//   const extensions = ['REACT_DEVELOPER_TOOLS'];

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload
//     )
//     .catch(console.log);
// };

let filterSwitch: boolean = false;

function handleFilterOption(event: IpcMainEvent, value: boolean) {
  filterSwitch = value;
}

ipcMain.on('set-filter', handleFilterOption);

async function handleFileOpen() {
  const { canceled, filePaths } = await dialog?.showOpenDialog({
    properties: [],
  });
  if (canceled) {
    return;
  } else {
    const data: string[][] = <Array<Array<string>>>await fileReader(filePaths);
    data.shift();

    let finalData: string[][] = [[]];
    if (filterSwitch) {
      for (var i = 0; i < data.length; i++) {
        let output: number = EMGFilter(
          SAMPLE_FREQUENCY.FREQ_500HZ,
          NOTCH_FREQUENCY.FREQ_50HZ,
          true,
          true,
          true,
          parseInt(data[i][1])
        );
        finalData = data;
        finalData[i].pop();
        finalData[i].push(output.toString());
      }
    } else {
      finalData = data;
    }

    return [filePaths[0], finalData];
  }
}

ipcMain.handle('dialog:openFile', handleFileOpen);
function fileReader(path: string[]) {
  return new Promise((resolve) => {
    let csvData: string[][] = [[]];
    for (let i = 0; i < path.length; i++) {
      let file: PathLike = <PathLike>path[i];
      fs.createReadStream(file)
        .pipe(parse({ delimiter: ',', from_line: 1 }))
        .on('data', function (csvrow: string[]) {
          csvData.push(csvrow);
        })
        .on('end', () => resolve(csvData));
    }
  });
}

ipcMain.handle('sendSaveData', (event, csvData) => {
  let data: number[][] = [];
  for (let i = 0; i < csvData[0].length; i++) {
    data.push([csvData[0][i], csvData[1][i]]);
  }
  const stringify = require('csv-stringify');
  stringify.stringify(data, (err: any, output: any) => {
    fs.writeFileSync(
      path.join(__dirname + '../../../assets/data/' + csvData[2] + '.csv'),
      output
    );
  });
});
// console.log('nooooooooo');

const createWindow = async () => {
  if (isDebug) {
    // await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 800,
    height: 680,
    icon: getAssetPath('icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  // new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
