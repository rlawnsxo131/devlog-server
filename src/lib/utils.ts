import * as util from 'util';
import * as crypto from 'crypto';
export const randomBytesPromise = util.promisify(crypto.randomBytes);
export const scryptPromise = util.promisify(crypto.scrypt);

export function groupByObjectId<T>(
  ids: ReadonlyArray<number>,
  rows: Array<T>,
  idResolver: (row: T) => number
) {
  const obj: {
    [key: number]: Array<T>;
  } = {};

  ids.forEach(id => {
    obj[id] = [];
  });

  rows.forEach(row => {
    obj[idResolver(row)].push(row);
  });

  return obj;
}

export async function createSortAndHash(
  target: string
): Promise<{ salt: string; hash: string }> {
  const salt = await randomBytesPromise(64);
  const stringSalt = salt.toString('base64');
  const hash = (await scryptPromise(target, stringSalt, 64)) as ReturnType<
    () => Buffer
  >;
  return {
    salt: stringSalt,
    hash: hash.toString('base64')
  };
}

export async function decrypt(target: string, salt: string) {
  const result = (await scryptPromise(target, salt, 64)) as ReturnType<
    () => Buffer
  >;
  return result.toString('base64');
}
