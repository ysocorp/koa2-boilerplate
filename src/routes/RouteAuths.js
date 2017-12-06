import { passport } from 'koa-smart/middlewares';
import { Strategy as LocalStrategy } from 'passport-local';

import Route from './Route';
import utils, { crypto } from '../base/utils';

export default class RouteAuths extends Route {
  constructor(params) {
    super({ ...params, model: 'users' });
    this._initPassportStrategy();
  }

  _initPassportStrategy() {
    // Strategy is call when login
    passport.use(new LocalStrategy(async (username, password, done) => {
      const user = await this.model.findOne({ where: { email: username } });
      if (user && crypto.compartPassword(password, user.password)) {
        delete user.dataValues.password;
        done(null, user);
      } else {
        done(null, false);
      }
    }));
  }

  _login(params) {
    const {
      ctx,
      messageErro,
      messageSuccess,
    } = params;
    const body = this.body(ctx, true);
    body.username = body.username || body.email;
    return passport.authenticate('local', async (err, user, info, status) => { // eslint-disable-line no-unused-vars
      if (user === false) {
        this.throw(401, messageErro);
      }
      const dataPromise = await ctx.loginUser(user.dataValues);
      const userInBody = await this._addUserInBody(ctx);
      this.sendOk(ctx, userInBody, messageSuccess);
      return dataPromise;
    })(ctx);
  }

  @Route.Post({
    accesses: [Route.accesses.public],
    params: {
      email: {
        __force: true,
        __func: [
          utils.trim,
          utils.test(utils.notEmpty),
          utils.toLowerCase,
        ],
      },
      first_name: false,
      last_name: false,
      mobile_phone: false,
      password: true,
      password_confirmation: true,
    },
  })
  async signup(ctx, next) {
    const body = this.body(ctx);
    if (body.password_confirmation !== body.password) {
      this.throw(400, ctx.state.__('Different password'));
    }
    const user = await this.model.create({
      ...body,
      usergroup_id: this.GROUPS.CLIENT_ID,
    });
    this.email.sendClientWelcome({ user });

    ctx.request.body.password = body.password;// this is to allow _login to get the password
    return this._login({
      ctx,
      next,
      messageErro: ctx.state.__('Incorrect email or password'),
      messageSuccess: null,
    });
  }

  @Route.Post({
    accesses: [Route.accesses.public],
    params: {
      email: {
        __force: true,
        __func: [
          utils.trim,
          utils.test(utils.notEmpty),
          utils.toLowerCase,
        ],
      },
      password: {
        __force: true,
        __func: [utils.trim],
      },
    },
  })
  async login(ctx, next) {
    return this._login({
      ctx,
      next,
      messageErro: ctx.state.__('Incorrect email or password'),
      messageSuccess: ctx.state.__('You are connected'),
    });
  }

  @Route.Get({
    accesses: [Route.accesses.public],
  })
  async logout(ctx) {
    await ctx.logoutUser();
    this.sendOk(ctx, null, ctx.state.__('Sign Out'));
  }

  @Route.Get({
    accesses: [Route.accesses.public],
  })
  async autologin(ctx) {
    if (ctx.state.user) {
      await this._addUserInBody(ctx);
    } else {
      this.throw(401);
    }
  }
}
