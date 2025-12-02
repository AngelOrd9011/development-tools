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
          let total = [];
          let incomplete = [];
          await _data.forEach((i) => {
            if (hasMissingValue(i)) incomplete.push(i);
            else total.push(i);
          });
          let hombres = total.filter((i) => i.sexo === '1');
          let mujeres = total.filter((i) => i.sexo === '2');
          let no_binarios = total.filter((i) => i.sexo === '3');
          let divided = {};
          total.forEach((i) => {
            if (!divided.hasOwnProperty(`${i.ramo}-${i.ur}`)) {
              divided[`${i.ramo}-${i.ur}`] = [i];
            } else {
              divided[`${i.ramo}-${i.ur}`].push(i);
            }
          });
          let sampling = [];
          Object.keys(divided).forEach((inst) => {
            let percentage = Math.ceil(divided[inst].length * 0.1);
            let _arr = [...divided[inst]];
            for (let i = _arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [_arr[i], _arr[j]] = [_arr[j], _arr[i]];
            }
            sampling = sampling.concat(_arr.slice(0, percentage));
          });
          setKeys(_keys);
          setData({
            total,
            incomplete,
            hombres,
            mujeres,
            no_binarios,
            sampling,
          });
        })
        .catch((err) => {
          setError(err?.message ?? err);
          //   showToast('error', '¡Ooops!', err?.message ?? err);
        })
        .finally(() => setLoading(false));
    }
  };

  const getCounters = async (prop) => {
    let _obj = {};
    const descartados = ['ramo', 'ur', 'area', 'id_area', 'ordinal'];
    await data[prop]?.forEach((item) => {
      Object.keys(item)
        .filter((i) => !descartados.includes(i))
        .forEach((key) => {
          if (!_obj[key]) {
            _obj[key] = {};
          }
          const value = item[key];
          _obj[key][value] = (_obj[key][value] || 0) + 1;
        });
    });
    return _obj;
  };

  const proccessData = async () => {
    const counters = {
      hombres: await getCounters('hombres'),
      mujeres: await getCounters('mujeres'),
      no_binarios: await getCounters('no_binarios'),
      total: await getCounters('total'),
    };

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
        data[prop].forEach((row, id) => {
          if (prop === 'total' && id >= 1000000) {
            Object.keys(row).forEach((key) => {
              stringData += `${row[key]?.replaceAll('\n', ' ')}|`;
            });
            stringData += '\n';
          } else {
            Object.keys(row).forEach((key) => {
              stringData += `${row[key]?.replaceAll('\n', ' ')}|`;
            });
            stringData += '\n';
          }
        });
        const file = new Blob(
          [stringData.replaceAll('||\n', '\n').replaceAll('|\n', '\n')],
          { type: 'text/plain' }
        );
        link.href = URL.createObjectURL(file);
        link.download = `ecco_${prop}.txt`;
        link.click();
      } catch (error) {
        setDownloading(false);
        setError(error?.message ?? error);
      } finally {
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
    <div className="main-content">
      <div>
        <h3>Procesar ECCO</h3>
        <input id="file" type="file" onChange={handleFileChange} />
      </div>
      {loading && <Loader text="Procesando información..." />}
      {data && !loading && (
        <>
          {downloading ? (
            <Loader text="Descargando..." />
          ) : (
            <div className="flex flex-wrap gap-3">
              <button className="btn-download" onClick={() => proccessData()}>
                Procesar conteos
              </button>
              <button
                className="btn-download"
                onClick={() => dataToTXT('sampling')}
              >
                Descargar muestra
              </button>
              <button
                className="btn-download"
                onClick={() => dataToTXT('total')}
              >
                Descargar archivo depurado
              </button>
              <button
                className="btn-download"
                onClick={() => dataToTXT('incomplete')}
              >
                Descargar archivo de incompletas
              </button>
            </div>
          )}
        </>
      )}
      {error}
    </div>
  );
};
