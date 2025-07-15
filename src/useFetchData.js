import { API_URL } from './constants';

const useFetchData = () => {
  const api_uri = API_URL;

  const fetchData = async (filas, path) => {
    let data = await fetch(`${api_uri}${path}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ filas }),
    })
      .then((res) => res?.json())
      .catch((e) => {
        console.log(e);
        throw new Error('Something went wrong');
      });
    return data;
  };

  return { fetchData };
};
export default useFetchData;
