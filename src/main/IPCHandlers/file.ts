import fs, { PathLike } from 'fs';
import { parse } from 'csv-parse';
import { dialog } from 'electron';
import path from 'path';

export async function handleFileOpen() {
  const { canceled, filePaths } = await dialog?.showOpenDialog({
    properties: [],
  });
  if (canceled) {
    return;
  } else {
    const data: string[][] = <Array<Array<string>>>await fileReader(filePaths);
    data.shift();

    let finalData: string[][] = [[]];
    finalData = data;

    return [[filePaths[0]], finalData];
  }
}

export async function handleFileSave(_: any, csvData: any) {
  let data: number[][] = [];
  for (let i = 0; i < csvData[0].length; i++) {
    data.push([csvData[0][i], csvData[1][i]]);
  }
  const stringify = require('csv-stringify');
  stringify.stringify(data, (err: any, output: any) => {
    fs.writeFileSync(
      path.join(__dirname + '../../../../assets/data/' + csvData[2] + '.csv'),
      output
    );
  });
}

export function fileReader(path: string[]) {
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
