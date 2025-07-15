import { useState } from 'react';
import { AnaliticoPlazas } from './componenst/AnaliticoPlazas';
import { BuscarCURP } from './componenst/BuscarCURP';
import { BuscarIdRUSP } from './componenst/BuscarIdRUSP';
import { BuscarPersonas } from './componenst/PuscarPersonas';

const App = () => {
  const pages = ['AnaliticoPlazas', 'BuscarPersonas', 'BuscarIdRUSP', 'BuscarCURP'];
  const [page, setPage] = useState('AnaliticoPlazas');

  return (
    <>
      <div>
        {pages.map((_page) => {
          return (
            <button key={`btn-${_page}`} onClick={() => setPage(_page)}>
              {_page}
            </button>
          );
        })}
      </div>
      {page === 'AnaliticoPlazas' && <AnaliticoPlazas />}
      {page === 'BuscarPersonas' && <BuscarPersonas />}
      {page === 'BuscarIdRUSP' && <BuscarIdRUSP />}
      {page === 'BuscarCURP' && <BuscarCURP />}
    </>
  );
};

export default App;
