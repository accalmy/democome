import { get, set, del } from 'idb-keyval';

export const idbGet = <T>(k: string) => get<T>(k);
export const idbSet = <T>(k: string, v: T) => set(k, v);
export const idbDel = (k: string) => del(k);
