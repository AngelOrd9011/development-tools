import { useState } from 'react';
import useExcel from '../hooks/useExcel';

export const AnalisisCertificacion = () => {
  const { excelReader, excelExport } = useExcel();
  const [error, setError] = useState(null);
  const [xlsx, setXlsx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleFileChange = async (e) => {
    setError(null);
    setLoading(true);
    if (e.target.files) {
      let file = e.target.files[0];
      await excelReader(file)
        .then(async (_data) => {
          setXlsx(_data);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => setLoading(false));
    }
  };

  const exportDataAsXLSX = async () => {
    setDownloading(true);
    await excelExport(xlsx, 'Certificación').finally(() =>
      setDownloading(false)
    );
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
        <h3>Analisis Certificación</h3>
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
      {xlsx && !loading && (
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-download"
            onClick={exportDataAsXLSX}
            disabled={downloading}
          >
            Descargar archivo XLSX
          </button>
        </div>
      )}
      {error}
    </div>
  );
};
