import { call } from '../api';

export default async (body) => {
  try {
    const res = await call('POST', 'page', body);
    return res.json();
  } catch (e) {
    console.error('save page', e);
    if (e) return e;
  }
};
