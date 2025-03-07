import { useState } from 'react';
import useExcel from './useExcel';
import useFormatter from './useFormatter';
import useValidations from './useValidations';

const App = () => {
  const { excelReader, excelExport, downloading } = useExcel();
  const { validateData, loading } = useValidations();
  const arrayToJSON = useFormatter();
  const [data, setData] = useState(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    setError(null);
    if (e.target.files) {
      let file = e.target.files[0];
      setFile(file);
      await excelReader(file)
        .then(async (_data) => {
          let result = arrayToJSON(_data?.Hoja1);
          setData(result);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
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
          <button className="btn-download" onClick={() => console.log(data)} disabled={downloading}>
            Descargar archivo depurado
          </button>
        </div>
      )}
      {error}
    </div>
  );
};

export default App;
