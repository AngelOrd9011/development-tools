import FileSaver from 'file-saver';
import { useState } from 'react';
import * as xlsx from 'xlsx';

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
          let arr = xlsx.utils.sheet_to_row_object_array(workbook.Sheets[sheetName], { raw: false });
          result[sheetName] = arr;
        });
        resolve(result);
      };

      reader.onerror = function (err) {
        reject(err);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  function formatExcelCols(json) {
    let widthArr = Object.keys(json[0]).map((key) => {
      if (key.length <= 8) return { width: key.length + 20 };
      return { width: key.length + 8 };
    });
    for (let i = 0; i < json.length; i++) {
      let value = Object.values(json[i]);
      for (let j = 0; j < value.length; j++) {
        if (value[j] !== null && value[j]?.length > widthArr[j]?.width) {
          widthArr[j].width = value[j]?.length;
        }
      }
    }
    return widthArr;
  }

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
      let wscols = formatExcelCols(sheet);
      worksheet['!cols'] = wscols;
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

  const onSave = (buffer, fileName) => {
    return new Promise((resolve) => {
      resolve(saveAsExcelFile(buffer, fileName));
    });
  };

  const saveAsExcelFile = (buffer, fileName) => {
    let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const data = new Blob([buffer], {
      type: EXCEL_TYPE,
    });
    FileSaver.saveAs(data, `Reultados - ${fileName}`);
  };
  return {
    excelReader,
    excelExport,
    downloading,
  };
};
export default useExcel;
