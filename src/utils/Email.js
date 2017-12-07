import config from 'config';
import { readFileSync } from 'fs';
import Handlebars from 'handlebars';

import * as utils from '../base/utils/utils';

export default class Email {
  constructor() {
    this.from = config.email.from;
    this.startSubject = config.email.startSubject || '';
    this.header = readFileSync('./src/public/email/_header.html');
    this.footer = readFileSync('./src/public/email/_footer.html');
    this.css = readFileSync('./src/public/email/_style-min.css');
    Handlebars.registerPartial('header', `${this.header}`);
    Handlebars.registerPartial('css', `${this.css}`);
    Handlebars.registerPartial('footer', `${this.footer}`);
  }

  async _send(subject, html, to) {
    if (config.email.htmlLog) {
      console.log('**************EMAIL TO SEND**************');
      console.log(html);
      console.log('**************!EMAIL TO SEND**************');
    }
    if (config.email.send) {
      const opt = {
        content: {
          from: this.from,
          subject: this.startSubject + subject,
          html,
        },
        recipients: [{ address: to }],
      };
      if (utils.isArray(to)) {
        opt.recipients = to.map(elem => ({ address: elem }));
      }
      // TODO Send email with opt
    }
    return null;
  }

  async _sendTemplate(templateName, subject, email, data) {
    const content = readFileSync(`./src/public/email/${templateName}.html`);
    const template = Handlebars.compile(`${content}`);
    const html = template({ ...data, config });
    return this._send(subject, html, email);
  }

  async sendClientWelcome({ user }) {
    const url = `${config.front}`;
    this._sendTemplate('clientWelcome', `Your access for ${config.appName}`, user.email, { user, url });
  }
}
