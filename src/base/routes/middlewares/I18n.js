import Gettext from 'node-gettext';
import { readFileSync } from 'fs';
import { join as pathJoin } from 'path';

let _instance = null;

export default class I18n {
  isInit = false;
  constructor() {
    this.locales = ['en_EN'];
    this.localeDefault = 'en_EN';
    this.gettext = new Gettext();

    // global.__ is here to let gettext parse the string to put them on .po file
    global.__ = string => string;
  }

  static get instance() {
    if (_instance === null) {
      _instance = new I18n();
    }
    return _instance;
  }

  init(path) {
    this.gettext.setTextDomain(this.localeDefault);
    const routePath = path || pathJoin(__dirname, '..', '..', '..', 'locales');
    this.locales.forEach((locale) => {
      this.gettext.addTranslations(locale, readFileSync(`${routePath}/${locale}.po`));
    });
    this.isInit = true;
  }

  static async middleware(ctx, next) {
    const that = I18n.instance;
    let locale = ctx.get('Accept-Language') || that.localeDefault;
    if (!that.locales.includes(locale)) {
      locale = that.localeDefault;
    }
    ctx.state.__ = string => that.gettext.dgettext(locale, string);
    await next();
  }
}
