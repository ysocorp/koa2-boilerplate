import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import config from 'config';
import jwt from 'jsonwebtoken';

let _instance = null;

export default class Crypto {
  constructor() {
    this.lengthPassword = 10;
  }

  static get instance() {
    if (_instance === null) {
      _instance = new Crypto();
    }
    return _instance;
  }

  encryptPassword(password) {
    return bcrypt.hashSync(password, this.lengthPassword);
  }

  compartPassword(password, passwordEncrypt) {
    return bcrypt.compareSync(password, passwordEncrypt);
  }

  generatePassword() {
    return Math.random().toString(36).slice(-8);
  }

  generateToken() {
    return crypto.randomBytes(128).toString('base64');
  }

  generateFileName() {
    return `${new Date().getTime()}__${crypto.randomBytes(32).toString('hex')}`;
  }

  generateJwtToken(data) {
    return jwt.sign(data, config.jsonwebtoken.privateKey);
  }

  getDataJwtToken(token) {
    try {
      return jwt.verify(token, config.jsonwebtoken.privateKey);
    } catch (error) {
      return null;
    }
  }
}

