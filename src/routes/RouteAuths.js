import Route from './Route';
import utils, { crypto } from '../base/utils';
import Email from '../utils/Email';

export default class RouteAuths extends Route {
  constructor(params) {
    super({ ...params, model: 'users' });
    this.email = new Email(); 
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
  async signup(ctx) {
    const body = this.body(ctx);
    if (body.password_confirmation !== body.password) {
      this.throw(400, ctx.state.__('Different password'));
    }
    const user = await this.model.create({
      ...body,
      usergroup_id: this.GROUPS.CLIENT_ID,
    });
    this.email.sendClientWelcome({ user });

    const userInBody = await this._addUserInBody(ctx, user.id);
    this.sendCreated(ctx, userInBody, ctx.state.__('Your account has been created'));
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
  async login(ctx) {
    const { email, password } = this.body(ctx);

    const user = await this.model.findOne({ where: { email } });
    if (user && crypto.compartPassword(password, user.password)) {
      delete user.dataValues.password;
    } else {
      this.throw(401, ctx.__('Incorrect email or password'));
    }

    await ctx.loginUser(user.dataValues);
    const userInBody = await this._addUserInBody(ctx);
    this.sendOk(ctx, userInBody, ctx.__('You are connected'));
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
