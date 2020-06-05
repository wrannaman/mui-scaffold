import { call } from '../api';

export default async (payload) => {
  try {
    const res = await call('PUT', `project/${payload.id}`, payload);
    return res.json();
  } catch (e) {
    if (e) return e;
    return { error: 'Unknown Error'};
  }
};
