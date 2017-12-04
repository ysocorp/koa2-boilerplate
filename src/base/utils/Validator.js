
let _instance = null;

// __ is here to let gettext parse the string to put them on .po file
const __ = string => string;

export default class Validator {
  constructor() {
    this.validators = {
      email: {
        regex: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$',
        msg: __('Invalid email'),
      },
      phone: {
        regex: '\\+[1-9]{1}[0-9]{0,2} [0-9]{1}[0-9 ]{6,20}',
        msg: __('Invalide phone'),
      },
      password: {
        regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[$@$!%*?&])[A-Za-z\\d$@$!%*?&]{6,10}',
        msg: __('Invalide password: Minimum 6 and maximum 10 characters, at least one uppercase letter, one lowercase letter, one number and one special character:'),
      },
      name: {
        regex: '.{2,80}',
        msg: __('The name must contain between 2 and 80 characters'),
      },
      url: {
        regex: '(https?:\\/\\/(?:www\\.|(?!www))[^\\s\\.]+\\.[^\\s]{2,}|www\\.[^\\s]+\\.[^\\s]{2,})',
        msg: __('Invalide URL. Ex: https://google.com ou http://google.com'),
      },
    };
  }

  static get instance() {
    if (_instance === null) {
      _instance = new Validator();
    }
    return _instance;
  }

  put({ key, regex, msg = __('Invalide field') }) {
    this.validators[key] = {
      regex,
      msg,
    };
    return this.get(key);
  }

  get(key) {
    return {
      ...this.validators[key],
      args: new RegExp(this.validators[key].regex),
    };
  }
}
