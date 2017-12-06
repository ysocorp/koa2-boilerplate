import { Route as RouteBase, StatusCode } from 'koa-smart';
import { GROUPS } from '../models/TableUsergroups';

export default class Route extends RouteBase {
  static accesses = {
    public: -1,
    connected: 100,
    admin: GROUPS.ADMIN_ID,
    client: GROUPS.CLIENT_ID,
  };

  constructor(params) {
    super(params);
    this.GROUPS = GROUPS;
  }

  // ************************************ MIDDLEWARE *********************************
  beforeRoute({ options }) {
    return async (ctx, next) => {
      const canAccess = this.mlCanAccessRoute(ctx, options);
      if (!canAccess) {
        this.throw(StatusCode.forbidden, ctx.state.__('Forbidden access'));
      }

      await super.beforeRoute({ options })(ctx, next);
    };
  }

  mlCanAccessRoute(ctx, { accesses }) {
    if (accesses && Array.isArray(accesses)) {
      const { user } = ctx.state;
      return accesses.includes(Route.accesses.public) ||
        (!!user && (
          accesses.includes(Route.accesses.connected) ||
          user.usergroup_id === Route.accesses.admin ||
          accesses.includes(user.usergroup_id)
        ));
    }
    return false;
  }

  // ************************************ !MIDDLEWARE *********************************

  user(ctx) { return ctx.state.user; }
  userId(ctx) { return (ctx.state.user) ? ctx.state.user.id : null; }
  userGroup(ctx) { return ctx.state.user.usergroup_id; }
  isAdmin(ctx) { return this.models.users.isAdmin(this.user(ctx)); }
  isClient(ctx) { return this.models.users.isAdmin(this.user(ctx)); }

  async _addUserInBody(ctx, id) {
    const user = await this.models.users.getDataUserById(id || ctx.state.user.id);
    if (!user) {
      this.throw(401);
    }
    ctx.body._user = user.dataValues;
    ctx.body._user.password = undefined;
    return ctx.body._user;
  }
}
