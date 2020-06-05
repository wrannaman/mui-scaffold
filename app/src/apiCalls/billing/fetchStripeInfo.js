import { call } from '../api';

export default async () => {
  try {
    const res = await call('GET', 'billing/info');
    return res.json();
  } catch (e) {
    if (e) return e;
    return { error: 'Unknown Error'};
  }
};
