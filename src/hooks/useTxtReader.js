const useTxtReader = () => {
  const stringToArray = (str) => {
    let keys = str.trim().split('\n')[0].split('|');
    keys.pop();
    let arr = str.trim().split('\n');
    arr.shift();
    let data = arr.map((row) => {
      let splittedRow = row.split('|');
      splittedRow.pop();
      let objRow = {};
      keys.forEach((key, index) => {
        objRow[key] = splittedRow[index]?.trim();
      });
      return objRow;
    });
    return { data, keys };
  };

  const fileReader = (file, parseStr) => {
    let reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = function (e) {
        let data = e.target.result;
        const decoder = new TextDecoder();
        const str = decoder.decode(data);
        if (parseStr) resolve(stringToArray(str));
        else resolve(str);
      };

      reader.onerror = function (err) {
        reject(err);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  return { fileReader };
};

export default useTxtReader;
