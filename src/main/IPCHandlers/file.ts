import fs, { PathLike } from 'fs';
import { parse } from 'csv-parse';
import { dialog } from 'electron';

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

    return [filePaths[0], finalData];
  }
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
