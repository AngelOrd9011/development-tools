import { AnalisisCertificacion } from './componenst/AnalisisCertificacion';
import { AnaliticoPlazas } from './componenst/AnaliticoPlazas';
import { AniosTrayectoria } from './componenst/AniosTrayectoria';
import { BuscarCURP } from './componenst/BuscarCURP';
import { BuscarIdRUSP } from './componenst/BuscarIdRUSP';
import { CargarPilares } from './componenst/CargarPilares';
import { ProcesarECCO } from './componenst/ProcesarECCO';
import { BuscarPersonas } from './componenst/PuscarPersonas';
import { UsuariosUPSP } from './componenst/UsuariosUPSP';
import { PAGES } from './constants';
import useLocalStorage from './hooks/useLocalStorage';

const App = () => {
  const [page, setPage] = useLocalStorage('tool', PAGES[0]);

  return (
    <>
      <div>
        {PAGES.map((_page) => {
          return (
            <button key={`btn-${_page}`} onClick={() => setPage(_page)}>
              {_page}
            </button>
          );
        })}
      </div>
      {page === PAGES[0] && <AnaliticoPlazas />}
      {page === PAGES[1] && <BuscarPersonas />}
      {page === PAGES[2] && <BuscarIdRUSP />}
      {page === PAGES[3] && <BuscarCURP />}
      {page === PAGES[4] && <CargarPilares />}
      {page === PAGES[5] && <UsuariosUPSP />}
      {page === PAGES[6] && <AnalisisCertificacion />}
      {page === PAGES[7] && <AniosTrayectoria />}
      {page === PAGES[8] && <ProcesarECCO />}
    </>
  );
};

export default App;
