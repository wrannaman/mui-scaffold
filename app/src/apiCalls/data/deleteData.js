import { call } from '../api';

export default async (id) => {
  try {
    const res = await call('DELETE', `data/${id}?id=${id}`);
    return res.json();
  } catch (e) {
    if (e) return e;
    return { error: 'Unknown Error'};
  }
};
