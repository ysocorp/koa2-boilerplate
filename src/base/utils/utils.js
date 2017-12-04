import moment from 'moment';
import Lodash from 'lodash';

export const lodash = Lodash;

export function getRandomInRange(from, to, fixed) {
  return ((Math.random() * (to - from)) + from).toFixed(fixed) * 1;
}

export function getRandomLatLongInFrance() {
  return {
    latitude: getRandomInRange(41.59101, 51.03457, 5),
    longitude: getRandomInRange(-4.65, 9.45, 5),
  };
}

export function ucFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}
export function capitalize(str) { return ucFirst(str); }

export function dateYYYYMMDD(date) {
  if (!date) { return undefined; }
  return moment(date).format('YYYY-MM-DD');
}

export function isArray(array) {
  return Array.isArray(array);
}

export function trim(elem) {
  if (elem.trim) {
    return elem.trim();
  }
  return null;
}

export async function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function isObject(obj, force = true) {
  if (force) {
    return !isArray(obj) && isObject(obj, false);
  }
  return typeof obj === 'object';
}

export function toLowerCase(str) {
  return str.toLowerCase();
}

export function isEmpty(data) {
  if (data === null || data === undefined) {
    return true;
  }
  if (typeof data === 'string') {
    return data === '';
  } else if (Array.isArray(data)) {
    return data.length === 0;
  } else if (typeof data === 'object') {
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        return false;
      }
    }
    return true;
  }
  return null;
}

export function notEmpty(elem) {
  return !isEmpty(elem);
}

export function nullIfEmpty(elem) {
  //TODO test if object, string or array
  return isEmpty(elem) ? null : elem;
}

export function jsonEncode(json) {
  return JSON.stringify(json).catch(() => null);
}

export function jsonDecode(string) {
  return JSON.parse(string).catch(() => null);
}

export function ucfirst(elem) {
  return elem.charAt(0).toUpperCase() + elem.slice(1);
}

export function toNumber(elem) {
  return Number(elem);
}

export function deepCopy(obj) {
  return Lodash.cloneDeep(obj);
}
