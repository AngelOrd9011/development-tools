import { useState } from 'react';
import useExcel from '../hooks/useExcel';
import useFetchData from '../hooks/useFetchData';

export const AniosTrayectoria = () => {
  const { excelReader, excelExport, downloading } = useExcel();
  const { fetchData } = useFetchData();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const sliceArray = (arr, n) => {
    const size = Math.ceil(arr.length / n);
    return Array.from({ length: n }, (_v, i) =>
      arr.slice(i * size, i * size + size)
    );
  };

  const execute = async (_data) => {
    let sliceSize = 200;
    let res = await Promise.all(
      sliceArray(_data, sliceSize).map(async (item) => {
        return fetchData(item, '/rusp/anio-trayectoria/').then(
          (response) => response
        );
      })
    );
    return res.flat();
  };

  const handleFileChange = async (e) => {
    setError(null);
    if (e.target.files) {
      let file = e.target.files[0];
      await excelReader(file)
        .then(async (_data) => {
          let keys = Object.keys(_data);
          let res = await execute(_data[keys[0]]);
          setData(res);
        })
        .catch((err) => {
          console.log(err);
          setError(err);
        });
    }
  };

  const exportData = async () => {
    console.log(data);

    await excelExport({ Resultados: data }, 'Resultados de trayectoria');
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
        <h3>Años de trayectoria registrada en RUSP</h3>
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      {data && (
        <div>
          <button
            className="btn-download"
            onClick={exportData}
            disabled={downloading}
          >
            Descargar archivo
          </button>
        </div>
      )}
      {error}
    </div>
  );
};
