import { useState } from 'react';
import useTxtReader from '../hooks/useTxtReader';

export const ProcesarECCO = () => {
  const { fileReader } = useTxtReader();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [keys, setKeys] = useState(null);

  const hasMissingValue = (obj) => {
    const values = Object.values(obj);
    return values.some(
      (value) => value === null || value === undefined || value === ''
    );
  };

  const handleFileChange = async (e) => {
    let file = e?.target?.files[0];
    setLoading(true);
    if (file) {
      await fileReader(file, true)
        .then(async ({ data: _data, keys: _keys }) => {
          let complete = [];
          let incomplete = [];
          await _data.forEach((i) => {
            if (hasMissingValue(i)) incomplete.push(i);
            else complete.push(i);
          });
          let men = complete.filter((i) => i.sexo === '1');
          let women = complete.filter((i) => i.sexo === '2');
          let nonbinary = complete.filter((i) => i.sexo === '3');
          let divided = {};
          complete.forEach((i) => {
            if (!divided.hasOwnProperty(`${i.ramo}-${i.ur}`)) {
              divided[`${i.ramo}-${i.ur}`] = [i];
            } else {
              divided[`${i.ramo}-${i.ur}`].push(i);
            }
          });
          let sampling = [];
          Object.keys(divided).forEach((inst) => {
            divided[inst].forEach((_i, id) => {
              if (id + 1 <= divided[inst].length * 0.1) sampling.push(_i);
            });
          });
          setKeys(_keys);
          setData({ complete, incomplete, men, women, nonbinary, sampling });
        })
        .catch((err) => {
          setError(err?.message ?? err);
          //   showToast('error', '¡Ooops!', err?.message ?? err);
        })
        .finally(() => setLoading(false));
    }
  };

  const proccessData = async () => {
    const counters = {
      hombres: {},
      mujeres: {},
      no_binarios: {},
      total: {},
    };
    const descartados = ['ramo', 'ur', 'area', 'id_area', 'ordinal'];
    data.men?.forEach((item) => {
      Object.keys(item)
        .filter((i) => !descartados.includes(i))
        .forEach((key) => {
          if (!counters.hombres[key]) {
            counters.hombres[key] = {};
          }
          const value = item[key];
          counters.hombres[key][value] =
            (counters.hombres[key][value] || 0) + 1;
        });
    });
    data.women?.forEach((item) => {
      Object.keys(item)
        .filter((i) => !descartados.includes(i))
        .forEach((key) => {
          if (!counters.mujeres[key]) {
            counters.mujeres[key] = {};
          }
          const value = item[key];
          counters.mujeres[key][value] =
            (counters.mujeres[key][value] || 0) + 1;
        });
    });
    data.nonbinary?.forEach((item) => {
      Object.keys(item)
        .filter((i) => !descartados.includes(i))
        .forEach((key) => {
          if (!counters.no_binarios[key]) {
            counters.no_binarios[key] = {};
          }
          const value = item[key];
          counters.no_binarios[key][value] =
            (counters.no_binarios[key][value] || 0) + 1;
        });
    });
    data.complete?.forEach((item) => {
      Object.keys(item)
        .filter((i) => !descartados.includes(i))
        .forEach((key) => {
          if (!counters.total[key]) {
            counters.total[key] = {};
          }
          const value = item[key];
          counters.total[key][value] = (counters.total[key][value] || 0) + 1;
        });
    });
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(counters)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'ecco_conteos.json';
    link.click();
  };

  const dataToTXT = (prop) => {
    setDownloading(true);
    setTimeout(async () => {
      try {
        let link = document.createElement('a');
        let stringData = `${keys.toString().replaceAll(',', '|')}\n`;
        await Promise.all(
          data[prop].map((row, id) => {
            console.log(id);
            Object.keys(row).forEach((key) => {
              stringData += `${row[key].replaceAll('\n', ' ')}|`;
            });
            stringData += '\n';
          })
        );
        const file = new Blob(
          [stringData.replaceAll('||\n', '\n').replaceAll('|\n', '\n')],
          { type: 'text/plain' }
        );
        link.href = URL.createObjectURL(file);
        link.download = `ecco_${prop}.txt`;
        link.click();
      } catch (error) {
        console.log(error);
      } finally {
        console.log('end');
        setDownloading(false);
      }
    }, 1000);
  };

  const Loader = ({ text }) => {
    return (
      <div>
        <div className="loader-container">
          <div className="loader">Loading...</div>
        </div>{' '}
        <div className="loader-text">{text}</div>
      </div>
    );
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
        <h3>Procesar ECCO</h3>
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      {loading && <Loader text="Procesando información..." />}
      {data && !loading && (
        <div className="flex flex-wrap gap-3">
          <button
            className="btn-download"
            onClick={() => proccessData()}
            disabled={downloading}
          >
            Procesar conteos
          </button>
          <button
            className="btn-download"
            onClick={() => dataToTXT('sampling')}
          >
            Descargar muestra
          </button>
          {downloading ? (
            <Loader text="Descargando..." />
          ) : (
            <button
              className="btn-download"
              onClick={() => dataToTXT('complete')}
            >
              Descargar archivo depurado
            </button>
          )}
        </div>
      )}
      {error}
    </div>
  );
};
