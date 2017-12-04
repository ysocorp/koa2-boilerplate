import config from 'config';
import requestPromise from 'request-promise';

export default class PushNotifications {
  constructor() {
    this.app_id = config.pushNotifications.app_id;
    this.Authorization = config.pushNotifications.Authorization;
    this.displayLog = config.pushNotifications.displayLog;
    this.templateIds = config.pushNotifications.templateIds;
    this.allowSendToAll = config.pushNotifications.allowSendToAll;
    this.includePlayerIdsToAll = config.pushNotifications.includePlayerIdsToAll;
  }

  log(str, ...args) {
    if (this.displayLog) {
      console.log(str, ...args);
    }
  }

  async _send({ player_ids, template_id, message, title, data = {}, toAll = false }) {
    this.log('**************PUSH_NOTIFICATION**************');
    this.log('PUSH_NOTIFICATION::player_ids', player_ids);
    this.log('PUSH_NOTIFICATION::message', message);
    this.log('PUSH_NOTIFICATION::title', title);
    let response = null;
    if (config.pushNotifications.send) {
      const option = {
        method: 'POST',
        uri: 'https://onesignal.com/api/v1/notifications',
        json: true,
        resolveWithFullResponse: true,
        simple: false,
        headers: {
          Authorization: this.Authorization,
        },
        body: {
          template_id,
          ios_badgeType: 'Increase',
          ios_badgeCount: 1,
          contents: message ? { en: message, fr: message } : undefined,
          headings: title ? { en: title, fr: title } : undefined,
          data,
        },
      };
      if (toAll) {
        if (this.allowSendToAll) {
          option.body.app_ids = [this.app_id];
        } else {
          option.body.app_id = this.app_id;
          option.body.include_player_ids = this.includePlayerIdsToAll;
        }
      } else {
        option.body.app_id = this.app_id;
        option.body.include_player_ids = player_ids;
      }
      response = await requestPromise(option);
      this.log('PUSH_NOTIFICATION::option', option);
      this.log('PUSH_NOTIFICATION::response', response.statusCode, response.body);
    }
    this.log('**************!PUSH_NOTIFICATION**************');
    return response;
  }

  async sendToAll({ message, title }) {
    return this._send({ message, title, toAll: true });
  }

  async sendNewClient({ player_ids }) {
    return this._send({ player_ids, template_id: this.templateIds.needUpdateDispo1 });
  }

}
