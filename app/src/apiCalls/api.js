// import { api } from '../../config';

let token = '';


export const maybeSetToken = (_token, force = false) => {
  if (!token) {
    token = _token;
  }
  // for log out
  if (force) token = _token;
};

const setToken = () => {
  const id_token = localStorage.getItem('@NOCO-id_token');
  if (id_token) maybeSetToken(id_token);
};

export const call = async (method, path, data) => {
  // headers
  const head = new Headers();
  head.append('Content-Type', 'application/json');
  head.append('Authorization', `Bearer ${token}`);
  if (!token) setToken();
  // init
  const init = {
    method,
    headers: head,
    // mode: 'cors',
    cache: 'default'
  };
  if ((method.toLowerCase() === 'post' && data) || (method.toLowerCase() === 'put' && data) || (method.toLowerCase() === 'delete' && data)) init.body = JSON.stringify(data);
  const req = new Request(`${api}/${path}`);
  const res = await fetch(req, init);
  return res;
};
