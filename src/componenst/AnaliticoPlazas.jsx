import { useState } from 'react';
import useExcel from '../useExcel';
import useFormatter from '../useFormatter';

export const AnaliticoPlazas = () => {
  const { excelReader, excelExport } = useExcel();
  const arrayToJSON = useFormatter();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [xlsx, setXlsx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleFileChange = async (e) => {
    setError(null);
    setLoading(true);
    if (e.target.files) {
      let file = e.target.files[0];
      setFile(file);
      await excelReader(file)
        .then(async (_data) => {
          setXlsx(_data?.Hoja1);
          let result = arrayToJSON(_data?.Hoja1);
          setData(result);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => setLoading(false));
    }
  };

  const exportDataAsXLSX = async () => {
    await excelExport({ 'Analitico de plazas': xlsx }, 'Analitico de plazas');
  };

  const exportData = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'codigos_presupuestales.json';

    link.click();
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
        <h3>Analítico de Plazas y Remuneraciones</h3>
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
        <div className="flex flex-wrap gap-3">
          <button className="btn-download" onClick={exportData} disabled={downloading}>
            Descargar archivo
          </button>
          <button className="btn-download" onClick={exportDataAsXLSX} disabled={downloading}>
            Descargar archivo XLSX
          </button>
        </div>
      )}
      {error}
    </div>
  );
};
