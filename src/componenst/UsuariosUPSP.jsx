import { hash } from 'bcryptjs';
import { useState } from 'react';
import useTxtReader from '../hooks/useTxtReader';

export const UsuariosUPSP = () => {
  const { fileReader } = useTxtReader();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const userWithPass = async (users) => {
    let res = await Promise.all(
      users.map(async (user) => {
        return {
          roles: { dignificacion: 'ENLACE' },
          password: await hash(user.rfc.substring(0, 10), 12),
          ...user,
        };
      })
    );
    return res;
  };

  const handleFileChange = async (e) => {
    let file = e?.target?.files[0];
    setLoading(true);
    if (file) {
      await fileReader(file)
        .then(async (_data) => {
          let json = JSON.parse(_data);
          let users = await userWithPass(json);
          setData(users);
        })
        .catch((err) => {
          setError(err?.message ?? err);
          //   showToast('error', '¡Ooops!', err?.message ?? err);
        })
        .finally(() => setLoading(false));
    }
  };

  const exportData = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'usuarios_upsp.json';

    link.click();
  };

  return (
    <div className="xlsx-cleaner-component">
      <div>
        <h3>Contraseñas de Usuarios UPSP</h3>
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
            onClick={exportData}
            disabled={downloading}
          >
            Descargar usuarios con contraseña
          </button>
        </div>
      )}
      {error}
    </div>
  );
};
