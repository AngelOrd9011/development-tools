import FileSaver from 'file-saver';
import { useState } from 'react';
import * as xlsx from 'xlsx-js-style';

const useExcel = () => {
  const [downloading, setDownloading] = useState(false);
  const excelReader = (file) => {
    let reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = function (e) {
        let data = e.target.result;
        let workbook = xlsx.read(data, {
          type: 'array',
        });
        let result = {};
        workbook.SheetNames.forEach(function (sheetName) {
          let arr = xlsx.utils.sheet_to_row_object_array(
            workbook.Sheets[sheetName],
            { raw: false }
          );
          result[sheetName] = arr;
        });
        console.log(result);
        resolve(result);
      };

      reader.onerror = function (err) {
        reject(err);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const onSave = (buffer, fileName) => {
    return new Promise((resolve) => {
      resolve(saveAsExcelFile(buffer, fileName));
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    let EXCEL_TYPE =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(data, fileName);
  };

  const excelExport = async (data, fileName) => {
    setDownloading(true);
    let sheets = { ...data };
    const workbook = {
      Sheets: {},
      SheetNames: [],
    };
    Object.keys(sheets).forEach((sheetName) => {
      let sheet = sheets[sheetName];
      let worksheet = xlsx.utils.json_to_sheet(sheet);
      let wscols = Object.keys(sheet[0]).map((_key) => {
        return { width: 40 };
      });
      worksheet['!cols'] = wscols;
      // for (let r = 0; r <= sheet.length; r++) {
      //   for (let i = 0; i < wscols?.length; i++) {
      //     let cell = worksheet[xlsx.utils.encode_cell({ r, c: i })];
      //     if (!cell?.s && r === 0) {
      //       cell.s = {
      //         fill: {
      //           patternType: 'solid',
      //           fgColor: { rgb: '611232' },
      //         },
      //         font: {
      //           name: 'Calibri',
      //           sz: 12,
      //           color: { rgb: 'FFFFFF' },
      //           bold: true,
      //           italic: false,
      //           underline: false,
      //         },
      //         border: {
      //           top: { color: { rgb: 'FFFFFF' }, style: 'dashed' },
      //           bottom: { color: { rgb: 'FFFFFF' }, style: 'dashed' },
      //           left: { color: { rgb: 'FFFFFF' }, style: 'dashed' },
      //           right: { color: { rgb: 'FFFFFF' }, style: 'dashed' },
      //         },
      //         alignment: {
      //           wrapText: true,
      //           vertical: 'center',
      //           horizontal: 'center',
      //         },
      //       };
      //     } else if (!cell?.s && r !== 0) {
      //       cell.s = {
      //         alignment: {
      //           wrapText: true,
      //           vertical: 'top',
      //         },
      //         border: {
      //           bottom: { color: { rgb: '000000' }, style: 'thin' },
      //           left: { color: { rgb: '000000' }, style: 'thin' },
      //           right: { color: { rgb: '000000' }, style: 'thin' },
      //         },
      //       };
      //     }
      //   }
      // }
      workbook.Sheets[sheetName] = worksheet;
      workbook.SheetNames.push(sheetName);
    });

    const excelBuffer = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    onSave(excelBuffer, fileName)
      .then(() => setDownloading(false))
      .catch((e) => {
        setDownloading(false);
        console.log(e);
      });
  };

  return {
    excelReader,
    excelExport,
    downloading,
  };
};
export default useExcel;
