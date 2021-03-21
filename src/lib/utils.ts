import { promisify } from 'util';
import { scrypt, randomBytes } from 'crypto';
export const randomBytesPromise = promisify(randomBytes);
export const scryptPromise = promisify(scrypt);

export function groupByObjectId<T>(
  ids: ReadonlyArray<number>,
  rows: Array<T>,
  idResolver: (row: T) => number,
) {
  const obj: {
    [key: number]: Array<T>;
  } = {};

  ids.forEach((id) => {
    obj[id] = [];
  });

  rows.forEach((row) => {
    obj[idResolver(row)].push(row);
  });

  return obj;
}

export async function createSaltAndHash(
  target: string,
): Promise<{ salt: string; hash: string }> {
  const salt = await randomBytesPromise(32);
  const stringSalt = salt.toString('base64');
  const hash = (await scryptPromise(target, stringSalt, 32)) as ReturnType<
    () => Buffer
  >;
  return {
    salt: stringSalt,
    hash: hash.toString('base64'),
  };
}

export async function decrypt(
  target?: string,
  salt?: string,
): Promise<string | undefined> {
  if (!target || !salt) {
    return undefined;
  }
  const result = (await scryptPromise(target, salt, 32)) as ReturnType<
    () => Buffer
  >;
  return result.toString('base64');
}

export function normalizedString(input: string): string {
  return input.replace(/(\s*)/gi, '');
}
