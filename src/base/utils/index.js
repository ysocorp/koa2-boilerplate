import Crypto from './Crypto';
import * as utils from './utils';
import * as utilsParam from './utils.param';
import Validator from './Validator';

export const validator = Validator.instance;
export const crypto = Crypto.instance;

export default {
  ...utilsParam,
  ...utils,
  crypto,
  validator,
};
