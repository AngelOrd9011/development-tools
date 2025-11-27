import { useState } from 'react';
import useExcel from '../hooks/useExcel';

export const CargarPilares = () => {
  const { excelReader } = useExcel();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleFileChange = async (e) => {
    setError(null);
    setLoading(true);
    if (e.target.files) {
      let file = e.target.files[0];
      await excelReader(file)
        .then(async (_data) => {
          let actividades_especificas = _data['Hoja1']
            .filter((item) => item['No.'].length === 5)
            .map((item) => {
              return {
                numero: item['No.'],
                nombre: item['Estrategia'],
                fecha_limite: { $date: '2025-12-31' },
                pnd: item?.PND ? true : false,
                ps: item?.PS ? true : false,
                pepc: item?.PEPC ? true : false,
                mir: item?.MIR ? true : false,
                metas_individuales: item?.['Metas Individuales'] ? true : false,
                marco_normativo: item['Marco Normativo']
                  .split('/')
                  .map((m) => m.trim()),
                avance: Number(item['% Avance'] ?? 0),
              };
            });
          let actividades_generales = _data['Hoja1']
            .filter((item) => item['No.'].length === 3)
            .map((item) => {
              return {
                numero: item['No.'],
                nombre: item['Estrategia'],
                fecha_limite: { $date: '2025-12-31' },
                avance: 0,
              };
            });
          let pilares = _data['Hoja1']
            .filter((item) => item['No.'].length === 1)
            .map((item) => {
              return {
                numero: item['No.'],
                nombre: item['Estrategia'],
                fecha_limite: { $date: '2025-12-31' },
                avance: 0,
              };
            });
          let new_data = {
            actividades_generales,
            actividades_especificas,
            pilares,
          };
          setData(new_data);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => setLoading(false));
    }
  };

  const exportData = (section) => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data[section])
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `${section}.json`;

    link.click();
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
        <h3>Pilares DGGSPSS</h3>
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
          <button
            className="btn-download"
            onClick={() => exportData('actividades_especificas')}
            disabled={downloading}
          >
            Descargar actividades especificas
          </button>
          <button
            className="btn-download"
            onClick={() => exportData('actividades_generales')}
            disabled={downloading}
          >
            Descargar actividades generales
          </button>
          <button
            className="btn-download"
            onClick={() => exportData('pilares')}
            disabled={downloading}
          >
            Descargar pilares
          </button>
        </div>
      )}
      {error}
    </div>
  );
};
