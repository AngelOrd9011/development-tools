import { useState } from 'react';
import useExcel from '../useExcel';
import useFetchData from '../useFetchData';
import useFormatter from '../useFormatter';
import useValidations from '../useValidations';

export const BuscarCURP = () => {
  const { excelReader, excelExport, downloading } = useExcel();
  const { validateData, loading } = useValidations();
  const { fetchData } = useFetchData();
  const arrayToJSON = useFormatter();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const sliceArray = (arr, n) => {
    const size = Math.ceil(arr.length / n);
    return Array.from({ length: n }, (_v, i) => arr.slice(i * size, i * size + size));
  };

  const execute = async (_data) => {
    let sliceSize = 200;
    let res = await Promise.all(
      sliceArray(_data, sliceSize).map(async (item) => {
        return fetchData(item, '/rusp/buscar-curp/').then((response) => response);
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
          setFile(_data);
          let keys = Object.keys(_data);
          let res = await execute(_data[keys[0]]);
          setData(res);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const exportData = async () => {
    console.log(data);

    await excelExport({ 'Personas encontradas': data }, 'Resultados');
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
        <h3>Buscar CURP´s por ID RUSP en RHNet</h3>
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      {loading && (
        <div>
          <div className="loader-container">
            <div className="loader">Loading...</div>
          </div>{' '}
          <div className="loader-text">Procesando información...</div>
        </div>
      )}
      {data && !loading && (
        <div>
          <button className="btn-download" onClick={exportData} disabled={downloading}>
            Descargar archivo
          </button>
        </div>
      )}
      {error}
    </div>
  );
};
