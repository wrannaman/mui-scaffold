import { call } from '../api';
const queryString = require('query-string');

export default async (opts) => {
  try {
    const stringified = queryString.stringify(opts);
    let tail = `repeatable/${opts.repeatableID || opts.id}`;
    if (opts) tail += `?${stringified}`;
    const res = await call('DELETE', tail);
    return res.json();
  } catch (e) {
    if (e) return e;
    return { error: 'Unknown Error'};
  }
};
