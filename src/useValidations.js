import { useState } from 'react';

const validateRowOnRHNET = async ({ id_rfi, ramo, id_colonia }) => {
  let res = await fetch(
    'http://localhost:4002/v1/api/sireho/valida-domicilio/',
    // 'https://kong-estandarizacion.buengobierno.gob.mx/diep/sireho/valida-domicilio/',
    {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_rfi, ramo, id_colonia }),
    }
  )
    .then((res) => res?.json())
    .catch((e) => {
      console.log(e);
      throw new Error('Something went wrong');
    });
  return res;
};

export const curpValida = (curp) => {
  let re =
    /^([A-Z][AEIOUX][A-Z]{2}\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])[HM](?:AS|B[CS]|C[CLMSH]|D[FG]|G[TR]|HG|JC|M[CNS]|N[ETL]|OC|PL|Q[TR]|S[PLR]|T[CSL]|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z\d])(\d)$/;
  let validado = curp.match(re);

  if (!validado) return false;

  const digitoVerificador = (curp17) => {
    let diccionario = '0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ';
    let lngSuma = 0.0;
    let lngDigito = 0.0;
    for (let i = 0; i < 17; i++) lngSuma = lngSuma + diccionario.indexOf(curp17.charAt(i)) * (18 - i);
    lngDigito = 10 - (lngSuma % 10);
    if (lngDigito == 10) return 0;
    return lngDigito;
  };

  if (validado[2] != digitoVerificador(validado[1])) return false;

  return true; //Validado
};

const useValidations = () => {
  const [loading, setLoading] = useState(false);
  const validateData = async (obj, setError) => {
    try {
      setLoading(true);
      let propNames = Object.keys(obj);
      let results = {};
      await Promise.all(
        propNames.map(async (prop) => {
          let data = await Promise.all(
            obj[prop]?.map(async (row) => {
              let colNames = Object.keys(row);
              let _row = {};
              colNames?.forEach((cell) => {
                let _cell;
                if (cell.startsWith('FECHA') || cell.startsWith('fecha')) {
                  _cell = new Date(row[cell]).toLocaleDateString('en-AU');
                } else if (cell === 'DOMICILIO_FISCAL') {
                  _cell = row[cell];
                } else if (cell === 'DICTAMEN_PRESUPUESTAL') {
                  _cell = row[cell];
                } else {
                  _cell = row[cell]
                    .toString()
                    .replace('.', '_pp_')
                    .replace(',', '_cc_')
                    .replace('Ñ', 'N')
                    .replace('ñ', 'n')
                    .replace('á', 'a')
                    .replace('é', 'e')
                    .replace('í', 'i')
                    .replace('ó', 'o')
                    .replace('ú', 'u')
                    .replace('Á', 'A')
                    .replace('É', 'E')
                    .replace('Í', 'I')
                    .replace('Ó', 'O')
                    .replace('Ú', 'U')
                    .replace(/(\n)/gm, ' ')
                    .replace(/[^\w\s]/gi, '')
                    .replace('_pp_', '.')
                    .replace('_cc_', ',');
                }
                _row[cell] = _cell;
              });
              if (prop === 'Contrato') {
                _row['OBSERVACIONES'] = '';
                let data = await validateRowOnRHNET({
                  id_rfi: _row['DOMICILIO_FISCAL'],
                  ramo: _row['ID_SECTOR'],
                  id_colonia: _row['ID_COLONIA_DOM'],
                });
                if (data && !data?.institucion) {
                  _row['OBSERVACIONES'] +=
                    ' - Verificar que el campo DOMICILIO_FISCAL (W) coincida con el campo ID_SECTOR (P), según el catálogo RIF/RIUF APF (https://uprh.apps.funcionpublica.gob.mx/sitio-rusp/cat_rfi/)';
                }
                if (data && data?.persona) {
                  _row['ID_PAIS_DOM'] = data?.persona?.id_pais;
                  _row['ID_DELEGACION_DOM'] = data?.persona?.id_estado;
                  _row['ID_DELEGACION_DOM'] = data?.persona?.id_delegacion;
                  _row['ID_COLONIA_DOM'] = data?.persona?.id_colonia;
                } else {
                  _row['OBSERVACIONES'] += ' - El campo ID_COLONIA_DOM no retorna una coincidencia valida';
                }
                if (_row['FUNDAMENTO_LEGAL']?.length > 500) {
                  _row[
                    'OBSERVACIONES'
                  ] += ` - Verificar que el campo FUNDAMENTO_LEGAL (V) no tengan más de 500 caracteres`;
                }
                if (_row['DISPOSICIONES']?.length > 500) {
                  _row[
                    'OBSERVACIONES'
                  ] += ` - Verificar que el campo DISPOSICIONES (S) no tengan más de 500 caracteres`;
                }
                if (!curpValida(_row['CURP'])) {
                  _row['OBSERVACIONES'] += ' - El campo CURP (B) no contiene una CURP valida';
                }
                if (!curpValida(_row['REPRESENTANTE'])) {
                  _row['OBSERVACIONES'] += ' - El campo REPRESENTANTE (T) no contiene una CURP valida';
                }
                if (_row['CURP'].substring(0, 9) !== _row['RFC'].substring(0, 9)) {
                  _row['OBSERVACIONES'] += ' - El campo CURP (B) Y RFC (C) no coinciden en sus primeros 10 caracteres';
                }
              }
              if (prop === 'Actividad') {
                _row['OBSERVACIONES'] = '';

                if (_row['DESCRIPCION_ACTIVIDAD']?.length > 2000) {
                  _row[
                    'OBSERVACIONES'
                  ] += ` - Verificar que el campo DESCRIPCION_ACTIVIDAD (C) no tengan más de 2000 caracteres`;
                }
              }
              if (prop === 'Experiencia') {
                _row['OBSERVACIONES'] = '';
                if (_row['PERIODO_EXPERIENCIA'] === 0 || _row['PERIODO_EXPERIENCIA'] === '0') {
                  _row['OBSERVACIONES'] += ' - El campo PERIODO_EXPERIENCIA (H) no puede ser 0';
                }
              }
              return _row;
            })
          ).then((_data) => _data);
          results[prop] = data;
          return prop;
        })
      ).then(() => setLoading(false));
      return results;
    } catch (e) {
      let _error = JSON.parse(JSON.stringify(_error));
      setError(_error?.message);
    }
  };

  return { validateData, loading };
};

export default useValidations;
